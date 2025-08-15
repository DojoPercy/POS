import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month, year

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date();

    // Base where clause
    const baseWhere = {
      companyId,
      ...(branchId && { branchId }),
    };

    // Date range where clause
    const dateWhere = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    // Get revenue data
    const revenueData = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        ...baseWhere,
        ...dateWhere,
        orderStatus: {
          in: ['COMPLETED', 'PAID'],
        },
      },
      _sum: {
        totalPrice: true,
        finalPrice: true,
      },
      _count: {
        id: true,
      },
    });

    // Get expenses data
    const expensesData = await prisma.expense.groupBy({
      by: ['dateAdded'],
      where: {
        ...baseWhere,
        dateAdded: {
          gte: fromDate,
          lte: toDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Process and group data based on groupBy parameter
    const processedData = processFinancialData(
      revenueData,
      expensesData,
      groupBy,
      fromDate,
      toDate
    );

    // Calculate summary statistics
    const summary = calculateSummaryStats(processedData);

    return NextResponse.json({
      data: processedData,
      summary,
      currency: 'USD', // You can make this dynamic based on company settings
    });
  } catch (error: any) {
    console.error('Financial analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function processFinancialData(
  revenueData: any[],
  expensesData: any[],
  groupBy: string,
  fromDate: Date,
  toDate: Date
) {
  const dataMap = new Map();

  // Process revenue data
  revenueData.forEach(item => {
    const date = new Date(item.createdAt);
    const key = getDateKey(date, groupBy);

    if (!dataMap.has(key)) {
      dataMap.set(key, {
        date: key,
        revenue: 0,
        orders: 0,
        expenses: 0,
        profit: 0,
        avgOrderValue: 0,
      });
    }

    const existing = dataMap.get(key);
    existing.revenue += item._sum.totalPrice || 0;
    existing.orders += item._count.id || 0;
    existing.avgOrderValue =
      existing.orders > 0 ? existing.revenue / existing.orders : 0;
  });

  // Process expenses data
  expensesData.forEach(item => {
    const date = new Date(item.dateAdded);
    const key = getDateKey(date, groupBy);

    if (!dataMap.has(key)) {
      dataMap.set(key, {
        date: key,
        revenue: 0,
        orders: 0,
        expenses: 0,
        profit: 0,
        avgOrderValue: 0,
      });
    }

    const existing = dataMap.get(key);
    existing.expenses += item._sum.amount || 0;
  });

  // Calculate profit and fill missing dates
  const result = [];
  const currentDate = new Date(fromDate);

  while (currentDate <= toDate) {
    const key = getDateKey(currentDate, groupBy);
    const data = dataMap.get(key) || {
      date: key,
      revenue: 0,
      orders: 0,
      expenses: 0,
      profit: 0,
      avgOrderValue: 0,
    };

    data.profit = data.revenue - data.expenses;
    result.push(data);

    // Move to next period
    moveToNextPeriod(currentDate, groupBy);
  }

  return result.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function getDateKey(date: Date, groupBy: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (groupBy) {
    case 'year':
      return `${year}`;
    case 'month':
      return `${year}-${month}`;
    case 'week':
      const weekNumber = getWeekNumber(date);
      return `${year}-W${weekNumber}`;
    case 'day':
    default:
      return `${year}-${month}-${day}`;
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function moveToNextPeriod(date: Date, groupBy: string): void {
  switch (groupBy) {
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'day':
    default:
      date.setDate(date.getDate() + 1);
      break;
  }
}

function calculateSummaryStats(data: any[]) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  // Calculate trends (comparing first half vs second half of the period)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);

  const firstHalfRevenue = firstHalf.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const secondHalfRevenue = secondHalf.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const firstHalfProfit = firstHalf.reduce((sum, item) => sum + item.profit, 0);
  const secondHalfProfit = secondHalf.reduce(
    (sum, item) => sum + item.profit,
    0
  );

  const revenueTrend =
    firstHalfRevenue > 0
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
      : 0;
  const profitTrend =
    firstHalfProfit > 0
      ? ((secondHalfProfit - firstHalfProfit) / firstHalfProfit) * 100
      : 0;

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    revenueTrend,
    profitTrend,
    expenseRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
  };
}
