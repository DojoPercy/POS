import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || 'current';

    // For now, we'll just return all shifts for the user
    // In a real app, you'd filter by the specific week
    const shifts = await prisma.shift.findMany({
      where: { userId: params.userId },
      include: {
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
      { error: 'Failed to fetch shifts' },
      { status: 500 },
    );
  }
}
