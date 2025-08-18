import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 🔹 Get comprehensive expense statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build where clause
    const whereClause: any = {};

    if (companyId) {
      whereClause.branch = {
        companyId: companyId,
      };
    }

    if (branchId) {
      whereClause.branchId = branchId;
    }

    if (from && to) {
      whereClause.dateAdded = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    // Get total expenses count
    const totalExpenses = await prisma.expense.count({
      where: whereClause,
    });

    // Get total amount
    const totalAmountResult = await prisma.expense.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const totalAmount = totalAmountResult._sum.amount || 0;

    // Calculate average amount
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Since status field doesn't exist in the schema, we'll set all to 0 for now
    // TODO: Add status field to Expense model if needed
    const pendingExpenses = 0;
    const approvedExpenses = totalExpenses; // All expenses are considered approved for now
    const rejectedExpenses = 0;

    // Get top categories by amount
    const topCategories = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    });

    // Get category names for top categories
    const categoryIds = topCategories
      .map(cat => cat.categoryId)
      .filter(Boolean);
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topCategoriesWithNames = topCategories.map(cat => {
      const category = categories.find((c: any) => c.id === cat.categoryId);
      return {
        category: category?.name || 'Unknown',
        amount: cat._sum.amount || 0,
        count: cat._count.id,
      };
    });

    const stats = {
      totalExpenses,
      totalAmount,
      averageAmount,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      topCategories: topCategoriesWithNames,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return NextResponse.json(
      { error: 'Error fetching expense statistics' },
      { status: 500 }
    );
  }
}

// Keep the existing POST method for backward compatibility
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
      { status: 500 }
    );
  }
}
