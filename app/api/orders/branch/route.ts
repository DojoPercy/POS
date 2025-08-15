import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis/redis';

interface OrderSummary {
  branchId: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  dateRange: {
    from: string;
    to: string;
  };
  byWaiter: Record<
    string,
    {
      waiterId: string;
      waiterName?: string | null;
      orders: number;
      items: number;
      amount: number;
      averageOrderValue: number;
    }
  >;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    items: number;
    amount: number;
  }>;
  topPerformers: {
    topWaiter: {
      waiterId: string;
      waiterName?: string | null;
      amount: number;
    } | null;
    busiestDay: { date: string; orders: number } | null;
    highestSalesDay: { date: string; amount: number } | null;
  };
  lastUpdated: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');
  const startDate = searchParams.get('from');
  const endDate = searchParams.get('to');

  // 1) branchId is mandatory
  if (!branchId) {
    return NextResponse.json(
      { error: 'branchId is required' },
      { status: 400 }
    );
  }

  // 2) Parse & validate dates
  let start: Date | undefined, end: Date | undefined;
  try {
    start = startDate ? new Date(startDate) : undefined;
    end = endDate ? new Date(endDate) : undefined;
    if (start && isNaN(start.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date format' },
        { status: 400 }
      );
    }
    if (end && isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid end date format' },
        { status: 400 }
      );
    }
    if (start && end && start > end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
    }
  } catch {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const startStr = start ? start.toISOString().split('T')[0] : 'any';
  const endStr = end ? end.toISOString().split('T')[0] : 'any';

  // 3) Cache key
  const cacheKey = `branch-summary-v2-${branchId}-${startStr}-${endStr}`;
  console.log('Cache Key:', cacheKey);

  try {
    // 4) Return cached if exists
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // 5) Fetch all waiters (role = 'user') in this branch, so we can build waiterName map
    const waiters = await prisma.user.findMany({
      where: {
        branchId,
        role: 'user',
      },
      select: {
        id: true,
        fullname: true,
      },
    });
    const waiterMap: Record<string, string> = {};

    for (const w of waiters) {
      waiterMap[w.id] = `${w.fullname}`.trim();
    }

    // 6) Fetch all orders for this branch (with date filters), including orderLines
    const orders = await prisma.order.findMany({
      where: {
        branchId,
        createdAt: {
          gte: start || undefined,
          lte: end || undefined,
        },
      },
      include: {
        orderLines: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    console.log(`Fetched ${orders.length} orders for branch ${branchId}`);

    // 7) Compute totals & averages
    const totalOrders = orders.length;
    const totalItems = orders.reduce((oAcc, o) => {
      return (
        oAcc +
        o.orderLines.reduce((lAcc, line) => lAcc + (line.quantity || 0), 0)
      );
    }, 0);

    const totalAmount = orders.reduce((oAcc, o) => {
      return (
        oAcc +
        o.orderLines.reduce(
          (lAcc, line) => lAcc + (line.quantity || 0) * (line.price || 0),
          0
        )
      );
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    const averageItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;

    // 8) Breakdown by waiter
    const byWaiter = orders.reduce(
      (map, o) => {
        const wId = o.waiterId!;
        if (!map[wId]) {
          map[wId] = {
            waiterId: wId,
            waiterName: waiterMap[wId] || null,
            orders: 0,
            items: 0,
            amount: 0,
            averageOrderValue: 0,
          };
        }
        const itemsInOrder = o.orderLines.reduce(
          (sum, line) => sum + (line.quantity || 0),
          0
        );
        const amtInOrder = o.orderLines.reduce(
          (sum, line) => sum + (line.quantity || 0) * (line.price || 0),
          0
        );

        map[wId].orders += 1;
        map[wId].items += itemsInOrder;
        map[wId].amount += amtInOrder;
        map[wId].averageOrderValue = map[wId].amount / map[wId].orders;

        return map;
      },
      {} as Record<
        string,
        {
          waiterId: string;
          waiterName?: string | null;
          orders: number;
          items: number;
          amount: number;
          averageOrderValue: number;
        }
      >
    );

    // 9) Daily breakdown
    const dailyMap = new Map<
      string,
      { orders: number; items: number; amount: number }
    >();
    for (const o of orders) {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      const itemsInOrder = o.orderLines.reduce(
        (sum, line) => sum + (line.quantity || 0),
        0
      );
      const amtInOrder = o.orderLines.reduce(
        (sum, line) => sum + (line.quantity || 0) * (line.price || 0),
        0
      );

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { orders: 0, items: 0, amount: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      day.orders += 1;
      day.items += itemsInOrder;
      day.amount += amtInOrder;
    }
    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 10) Determine top performers
    const waiterEntries = Object.values(byWaiter);
    const topWaiter =
      waiterEntries.length > 0
        ? waiterEntries.reduce((top, curr) =>
            curr.amount > top.amount ? curr : top
          )
        : null;

    const busiestDay =
      dailyBreakdown.length > 0
        ? dailyBreakdown.reduce((b, curr) =>
            curr.orders > b.orders ? curr : b
          )
        : null;

    const highestSalesDay =
      dailyBreakdown.length > 0
        ? dailyBreakdown.reduce((h, curr) =>
            curr.amount > h.amount ? curr : h
          )
        : null;

    // 11) Build final summary object
    const summary: OrderSummary = {
      branchId,
      totalOrders,
      totalItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      averageItemsPerOrder: Number(averageItemsPerOrder.toFixed(1)),
      dateRange: {
        from: startStr,
        to: endStr,
      },
      byWaiter,
      dailyBreakdown,
      topPerformers: {
        topWaiter: topWaiter
          ? {
              waiterId: topWaiter.waiterId,
              waiterName: topWaiter.waiterName,
              amount: Number(topWaiter.amount.toFixed(2)),
            }
          : null,
        busiestDay: busiestDay
          ? {
              date: busiestDay.date,
              orders: busiestDay.orders,
            }
          : null,
        highestSalesDay: highestSalesDay
          ? {
              date: highestSalesDay.date,
              amount: Number(highestSalesDay.amount.toFixed(2)),
            }
          : null,
      },
      lastUpdated: new Date().toISOString(),
    };

    // 12) Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(summary), 'EX', 300);

    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('Error generating branch summary v2:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate branch summary',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
