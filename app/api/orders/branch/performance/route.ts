import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis/redis';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');
  const period = searchParams.get('period') || '7'; // days
  const metric = searchParams.get('metric') || 'sales'; // sales, orders, items

  if (!branchId) {
    return NextResponse.json(
      { error: 'branchId is required' },
      { status: 400 },
    );
  }

  const days = Number.parseInt(period);
  if (isNaN(days) || days < 1 || days > 365) {
    return NextResponse.json(
      { error: 'Period must be between 1 and 365 days' },
      { status: 400 },
    );
  }

  const cacheKey = `branch-performance-${branchId}-${period}-${metric}`;

  try {
    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    // Fetch orders for the period
    const orders = await prisma.order.findMany({
      where: {
        branchId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderLines: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Generate daily data points
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayOrders = orders.filter(
        order => order.createdAt >= dayStart && order.createdAt <= dayEnd,
      );

      const dayItems = dayOrders.reduce(
        (sum, order) =>
          sum +
          order.orderLines.reduce(
            (lineSum, line) => lineSum + (line.quantity || 0),
            0,
          ),
        0,
      );

      const daySales = dayOrders.reduce(
        (sum, order) =>
          sum +
          order.orderLines.reduce(
            (lineSum, line) =>
              lineSum + (line.quantity || 0) * (line.price || 0),
            0,
          ),
        0,
      );

      dailyData.push({
        date: dateStr,
        orders: dayOrders.length,
        items: dayItems,
        sales: Number(daySales.toFixed(2)),
        [metric]:
          metric === 'orders'
            ? dayOrders.length
            : metric === 'items'
              ? dayItems
              : Number(daySales.toFixed(2)),
      });
    }

    const result = {
      branchId,
      period: days,
      metric,
      data: dailyData,
      summary: {
        totalOrders: orders.length,
        totalItems: dailyData.reduce((sum, day) => sum + day.items, 0),
        totalSales: dailyData.reduce((sum, day) => sum + day.sales, 0),
        averageDaily: {
          orders: Number((orders.length / days).toFixed(1)),
          items: Number(
            (dailyData.reduce((sum, day) => sum + day.items, 0) / days).toFixed(
              1,
            ),
          ),
          sales: Number(
            (dailyData.reduce((sum, day) => sum + day.sales, 0) / days).toFixed(
              2,
            ),
          ),
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 600);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error generating branch performance data:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate performance data',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
