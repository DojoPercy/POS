import { DecodedToken } from '@/lib/types/types';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const companyId = searchParams.get('companyId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build where clause
    const whereClause: any = {};

    if (branchId) {
      whereClause.branchId = branchId;
    }

    if (companyId) {
      whereClause.branch = {
        companyId: companyId,
      };
    }

    if (from && to) {
      whereClause.dateAdded = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
        branch: true,
      },
      orderBy: {
        dateAdded: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedExpenses = expenses.map(expense => ({
      id: expense.id,
      title: expense.itemName,
      amount: expense.amount,
      category: expense.category.name,
      branchId: expense.branchId,
      branchName: expense.branch.name,
      date: expense.dateAdded.toISOString(),
      description: expense.itemName,
      status: 'approved', // All expenses are considered approved since status field doesn't exist
    }));

    return NextResponse.json(transformedExpenses, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);

    const body = await req.json();

    // Handle both old format (branch) and new format (owner)
    const {
      // New format (owner)
      title,
      category,
      date,
      description,
      // Old format (branch) - backward compatibility
      itemName,
      categoryId,
      quantity,
      // Common fields
      amount,
      branchId,
      companyId,
      isFrequent = false,
    } = body;

    const [expense, frequentItem] = await prisma.$transaction(async tx => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          userId: decodedToken.userId || '',
          itemName: title || itemName || description || 'Untitled Expense',
          quantity: quantity || 1,
          categoryId: category || categoryId,
          amount: parseFloat(amount),
          dateAdded: date ? new Date(date) : new Date(),
          isFrequent,
          branchId: branchId || decodedToken.branchId || '',
          companyId: companyId || decodedToken.companyId || '',
        },
        include: {
          category: true,
          branch: true,
        },
      });

      let frequentItem = null;
      if (isFrequent) {
        frequentItem = await tx.frequentItem.create({
          data: {
            userId: decodedToken.userId || '',
            itemName: title || itemName || description || 'Untitled Expense',
            categoryId: category || categoryId,
            quantity: quantity || 1,
            branchId: branchId || decodedToken.branchId || '',
          },
        });
      }
      return [expense, frequentItem];
    });

    return NextResponse.json({ expense, frequentItem }, { status: 200 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
