import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 🔹 Get total count of expenses in a date range
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const { from, to } = await req.json();

    const totalCount = await prisma.expense.count({
      where: {
        companyId: companyId || undefined,
        branchId: branchId || undefined,
        dateAdded: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    return NextResponse.json({ totalCount });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching total count' },
      { status: 500 },
    );
  }
}
