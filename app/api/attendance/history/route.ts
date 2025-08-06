import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    if (!branchId && !companyId) {
      return NextResponse.json(
        { error: 'Branch ID or Company ID is required' },
        { status: 400 },
      );
    }

    const whereClause: any = {};

    if (branchId) whereClause.branchId = branchId;
    if (companyId) whereClause.companyId = companyId;
    if (userId) whereClause.userId = userId;

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

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

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance history' },
      { status: 500 },
    );
  }
}
