import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || 'current';
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on week parameter
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (week) {
      case 'next':
        startDate = new Date(now);
        startDate.setDate(now.getDate() + 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'previous':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      default: // current
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of current week (Saturday)
        break;
    }

    const shifts = await prisma.shift.findMany({
      where: {
        userId: userId,
        // You can add additional filtering here if needed
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
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching user shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user shifts' },
      { status: 500 }
    );
  }
}
