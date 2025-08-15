import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { companyId, isActive: true };
    if (branchId && branchId !== 'all') {
      whereClause.branchId = branchId;
    }

    const templates = await prisma.shiftTemplate.findMany({
      where: whereClause,
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

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching shift templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shift templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      branchId,
      companyId,
      dayOfWeek,
      startTime,
      endTime,
      role,
      maxStaff,
    } = body;

    const template = await prisma.shiftTemplate.create({
      data: {
        name,
        branchId,
        companyId,
        dayOfWeek: Number.parseInt(dayOfWeek),
        startTime,
        endTime,
        role,
        maxStaff: Number.parseInt(maxStaff) || 1,
        isActive: true,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating shift template:', error);
    return NextResponse.json(
      { error: 'Failed to create shift template' },
      { status: 500 }
    );
  }
}
