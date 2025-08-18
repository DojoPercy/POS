import { prisma } from '../../../../../lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { DecodedToken } from '@/lib/types/types';
import { jwtDecode } from 'jwt-decode';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const item = await prisma.frequentItem.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: 'Frequent item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error fetching frequent item:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const item = await prisma.frequentItem.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error deleting frequent item:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);

    const { itemName, categoryId, branchId, quantity } = await request.json();

    const item = await prisma.frequentItem.update({
      where: {
        id: params.id,
      },
      data: {
        userId: decodedToken.userId || '',
        itemName,
        categoryId,
        branchId,
        quantity: quantity || 1,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error updating frequent item:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
