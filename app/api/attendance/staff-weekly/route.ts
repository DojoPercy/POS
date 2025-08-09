import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const branchId = searchParams.get('branchId');
    const companyId = searchParams.get('companyId');
    const weekStart = searchParams.get('weekStart'); // ISO string

    if (!userId || !branchId || !companyId) {
      return NextResponse.json(
        { error: 'userId, branchId, and companyId are required' },
        { status: 400 }
      );
    }

    const startDate = weekStart ? new Date(weekStart) : startOfWeek(new Date());
    const endDate = endOfWeek(startDate);
    const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Get user's shifts for the week
    const shifts = await prisma.shift.findMany({
      where: {
        userId,
        branchId,
        companyId,
        dayOfWeek: {
          in: weekDays.map((day, index) => index), // 0 = Sunday, 1 = Monday, etc.
        },
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    // Get attendance records for the week
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        branchId,
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Create weekly schedule with attendance status
    const weeklySchedule = weekDays.map((day, index) => {
      const dayOfWeek = index; // 0 = Sunday, 1 = Monday, etc.
      const shift = shifts.find(s => s.dayOfWeek === dayOfWeek);
      const attendance = attendanceRecords.find(a => 
        format(a.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      return {
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEEE'),
        dayOfWeek,
        shift: shift ? {
          id: shift.id,
          title: shift.title,
          startTime: shift.startTime,
          endTime: shift.endTime,
          status: shift.status,
          shiftState: shift.shiftState,
          role: shift.role,
        } : null,
        attendance: attendance ? {
          id: attendance.id,
          signInTime: attendance.signInTime,
          signOutTime: attendance.signOutTime,
          status: attendance.status,
          totalHours: attendance.totalHours,
        } : null,
        hasShift: !!shift,
        hasAttendance: !!attendance,
        isCompleted: attendance?.status === 'SIGNED_OUT' || attendance?.status === 'COMPLETED',
      };
    });

    return NextResponse.json({
      userId,
      branchId,
      companyId,
      weekStart: format(startDate, 'yyyy-MM-dd'),
      weekEnd: format(endDate, 'yyyy-MM-dd'),
      weeklySchedule,
      summary: {
        totalShifts: shifts.length,
        completedShifts: weeklySchedule.filter(day => day.isCompleted).length,
        totalHours: attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching staff weekly attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff weekly attendance' },
      { status: 500 }
    );
  }
}
