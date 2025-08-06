import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const branchId = searchParams.get('branchId');
    const companyId = searchParams.get('companyId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!branchId && !companyId) {
      return NextResponse.json(
        { error: 'branchId or companyId is required' },
        { status: 400 },
      );
    }

    const revenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        companyId: companyId || undefined,
        branchId: branchId || undefined,
        ...(from && to
          ? {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }
          : {}),
      },
    });
    const expenses = await prisma.expense.findMany({
      where: {
        companyId: companyId || undefined,
        branchId: branchId || undefined,
        ...(from && to
          ? {
            dateAdded: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }
          : {}),
      },
      select: {
        amount: true,
        quantity: true,
      },
    });

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount * expense.quantity,
      0,
    );

    const totalSummary = {
      totalRevenue: revenue._sum.totalPrice || 0,
      totalExpense: totalExpense || 0,
      profit: (revenue._sum.totalPrice || 0) - (totalExpense || 0),
    };
    return NextResponse.json(totalSummary, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
