import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { DecodedToken } from '@/lib/types/types';
import { jwtDecode } from 'jwt-decode';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');

    const whereClause: any = {};

    // Handle both companyId (owner) and branchId (branch) for backward compatibility
    if (companyId) {
      whereClause.branch = {
        companyId: companyId,
      };
    } else if (branchId) {
      // For branch system, filter by branchId directly
      whereClause.branchId = branchId;
    }

    const items = await prisma.frequentItem.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include branch name
    const transformedItems = items.map(item => ({
      ...item,
      branch: {
        name: 'Branch Name', // This would need to be fetched separately or added to schema
      },
    }));

    return NextResponse.json(transformedItems, { status: 200 });
  } catch (error) {
    console.error('Error fetching frequent items:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);

    const body = await request.json();

    // Handle both old format (branch) and new format (owner)
    const {
      // New format (owner)
      itemName: newItemName,
      categoryId: newCategoryId,
      branchId: newBranchId,
      quantity: newQuantity,
      companyId,
      // Old format (branch) - backward compatibility
      itemName,
      categoryId,
      branchId,
      quantity,
      isFrequent,
    } = body;

    // Use new format if available, otherwise fall back to old format
    const finalItemName = newItemName || itemName;
    const finalCategoryId = newCategoryId || categoryId;
    const finalBranchId = newBranchId || branchId;
    const finalQuantity = newQuantity || quantity || 1;

    const item = await prisma.frequentItem.create({
      data: {
        userId: decodedToken.userId || '',
        itemName: finalItemName,
        categoryId: finalCategoryId,
        branchId: finalBranchId,
        quantity: finalQuantity,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error creating frequent item:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
