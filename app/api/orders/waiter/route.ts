import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

import redis from '@/lib/redis/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const waiterId = searchParams.get('waiterId');
  const startDate = searchParams.get('from');
  const endDate = searchParams.get('to');

  if (!waiterId) {
    return NextResponse.json(
      { error: 'waiterId is required' },
      { status: 400 }
    );
  }

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  const startStr = start ? start.toISOString().split("T")[0] : "any";
  const endStr = end ? end.toISOString().split("T")[0] : "any";

  const cacheKey = `order-summary-${waiterId}-${startStr}-${endStr}`;
  console.log("Cache Key:", cacheKey);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit:", cacheKey);
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // Fetch orders with optional date filters
    const orders = await prisma.order.findMany({
      where: {
        waiterId,
        createdAt: {
          gte: start || undefined,
          lte: end || undefined,
        },
      },
      include: {
        orderLines: true,
      },
    });

    // Compute summary
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, order) =>
      sum + order.orderLines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0);

    const totalAmount = orders.reduce((sum, order) =>
      sum + order.orderLines.reduce((lineSum, line) => lineSum + (line.price * line.quantity), 0),
    0);

    const summary = {
      waiterId,
      totalOrders,
      totalItems,
      totalAmount,
      dateRange: {
        from: startStr,
        to: endStr,
      }
    };

    await redis.set(cacheKey, JSON.stringify(summary), 'EX', 60 * 1); // cache for 1 min

    return NextResponse.json(summary, { status: 200 });

  } catch (error: any) {
    console.error('Error generating waiter summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
