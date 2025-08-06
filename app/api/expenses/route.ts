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
    if (branchId) {
      const expenses = await prisma.expense.findMany({
        where: {
          branchId: branchId ? { equals: branchId } : undefined,
        },
        include: {
          category: true,
        },
        orderBy: {
          dateAdded: 'desc',
        },
      });
      return NextResponse.json(expenses, { status: 200 });
    }
    if (companyId) {
      const expenses = await prisma.expense.findMany({
        where: {
          branch: {
            companyId: companyId ? { equals: companyId } : undefined,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          dateAdded: 'desc',
        },
      });
      return NextResponse.json(expenses, { status: 200 });
    }
  } catch (error) {
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

    const {
      itemName,
      quantity,
      categoryId,
      amount,
      branchId,
      companyId,
      isFrequent,
    } = await req.json();
    const [expense, frequentItem] = await prisma.$transaction(async tx => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          userId: decodedToken.userId || '',
          itemName,
          quantity,
          categoryId,
          amount,
          isFrequent,
          branchId: decodedToken.branchId || '',

          companyId: decodedToken.companyId || '',
        },
        include: {
          category: true,
        },
      });

      let frequentItem = null;
      console.log([isFrequent, frequentItem]);
      if (isFrequent) {
        frequentItem = await tx.frequentItem.create({
          data: {
            userId: decodedToken.userId || '',
            itemName,
            categoryId,
            quantity,
            branchId: decodedToken.branchId || '',
          },
        });
      }
      console.log([expense, frequentItem]);
      return [expense, frequentItem];
    });

    return NextResponse.json({ expense, frequentItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
