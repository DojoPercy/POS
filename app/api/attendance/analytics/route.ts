import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Set default date range (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = startDate ? new Date(startDate) : defaultStartDate;
    const dateEnd = endDate ? new Date(endDate) : defaultEndDate;

    // Build where clause
    const whereClause: any = {
      companyId,
      date: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (branchId && branchId !== 'all') {
      whereClause.branchId = branchId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    // Get attendance records with detailed information
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { signInTime: 'desc' }],
    });

    // Get summary statistics
    const totalRecords = attendanceRecords.length;
    const completedShifts = attendanceRecords.filter(
      r => r.signInTime && r.signOutTime
    ).length;
    const incompleteShifts = attendanceRecords.filter(
      r => r.signInTime && !r.signOutTime
    ).length;
    const totalHours = attendanceRecords.reduce(
      (sum, record) => sum + (record.totalHours || 0),
      0
    );
    const averageHours = totalRecords > 0 ? totalHours / completedShifts : 0;

    // Get branch-wise statistics
    const branchStats = await prisma.attendance.groupBy({
      by: ['branchId'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalHours: true,
      },
    });

    const branchStatsWithNames = await Promise.all(
      branchStats.map(async stat => {
        const branch = await prisma.branch.findUnique({
          where: { id: stat.branchId },
          select: { name: true, city: true },
        });
        return {
          branchId: stat.branchId,
          branchName: branch?.name || 'Unknown',
          branchCity: branch?.city || 'Unknown',
          totalShifts: stat._count.id,
          totalHours: stat._sum.totalHours || 0,
          averageHours:
            stat._count.id > 0
              ? (stat._sum.totalHours || 0) / stat._count.id
              : 0,
        };
      })
    );

    // Get user-wise statistics
    const userStats = await prisma.attendance.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalHours: true,
      },
    });

    const userStatsWithNames = await Promise.all(
      userStats.map(async stat => {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: { fullname: true, email: true, role: true },
        });
        return {
          userId: stat.userId,
          userName: user?.fullname || 'Unknown',
          userEmail: user?.email || 'Unknown',
          userRole: user?.role || 'Unknown',
          totalShifts: stat._count.id,
          totalHours: stat._sum.totalHours || 0,
          averageHours:
            stat._count.id > 0
              ? (stat._sum.totalHours || 0) / stat._count.id
              : 0,
        };
      })
    );

    // Get daily attendance trends
    const dailyTrends = await prisma.attendance.groupBy({
      by: ['date'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalHours: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get current active sessions (signed in but not out)
    const activeSessions = await prisma.attendance.findMany({
      where: {
        ...whereClause,
        signInTime: { not: null },
        signOutTime: null,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    // Calculate current working hours for active sessions
    const activeSessionsWithHours = activeSessions.map(session => {
      const currentTime = new Date();
      const signInTime = new Date(session.signInTime!);
      const currentHours =
        (currentTime.getTime() - signInTime.getTime()) / (1000 * 60 * 60);

      return {
        ...session,
        currentWorkingHours: currentHours,
      };
    });

    return NextResponse.json({
      summary: {
        totalRecords,
        completedShifts,
        incompleteShifts,
        totalHours,
        averageHours,
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString(),
        },
      },
      records: attendanceRecords,
      branchStats: branchStatsWithNames,
      userStats: userStatsWithNames,
      dailyTrends,
      activeSessions: activeSessionsWithHours,
    });
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance analytics' },
      { status: 500 }
    );
  }
}
