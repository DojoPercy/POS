import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const companyId = searchParams.get('companyId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    if (!companyId || !fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Company ID, From date, and To date are required' },
        { status: 400 }
      );
    }

    const topMenus = await prisma.orderLine.aggregateRaw({
      pipeline: [
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order',
          },
        },
        { $unwind: '$order' },
        {
          $match: {
            'order.companyId': { $oid: companyId },
            'order.createdAt': {
              $gte: { $date: new Date(fromDate).toISOString() },
              $lte: { $date: new Date(toDate).toISOString() },
            },
          },
        },
        {
          $group: {
            _id: '$menuItemId',
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 7 },
        {
          $lookup: {
            from: 'Menu',
            localField: '_id',
            foreignField: '_id',
            as: 'menu',
          },
        },
        { $unwind: '$menu' },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            menu: 1,
          },
        },
      ],
    });

    if (!topMenus || topMenus.length === 0) {
      return NextResponse.json(
        { error: 'No menu items found' },
        { status: 404 }
      );
    }

    return NextResponse.json(topMenus, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}
