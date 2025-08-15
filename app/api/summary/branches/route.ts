import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const companyId = searchParams.get('companyId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'From and To dates are required' },
        { status: 400 }
      );
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const pipeline = [
      {
        $match: {
          companyId: { $oid: companyId },
          orderStatus: { $ne: 'PENDING' },
          createdAt: {
            $gte: { $date: from.toISOString() },
            $lte: { $date: to.toISOString() },
          },
        },
      },
      {
        $group: {
          _id: '$branchId',
          totalRevenue: { $sum: '$totalPrice' },
          totalSales: {
            $sum: { $size: { $ifNull: ['$orderLines', []] } },
          },
        },
      },
      {
        $lookup: {
          from: 'Branch', // Prisma uses PascalCase collection names
          localField: '_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $project: {
          _id: 0,
          branch: '$branch.name',
          sales: '$totalSales',
          revenue: { $round: ['$totalRevenue', 2] },
        },
      },
    ];

    const result = await prisma.order.aggregateRaw({ pipeline });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/summary/branches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
