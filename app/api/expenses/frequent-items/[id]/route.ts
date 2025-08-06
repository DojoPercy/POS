import { prisma } from '../../../../../lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const item = await prisma.frequentItem.findUnique({
    where: {
      id: params.id || undefined,
    },
  });
  return NextResponse.json(item, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const item = await prisma.frequentItem.delete({
    where: {
      id: params.id || undefined,
    },
  });
  return NextResponse.json(item, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { name, branchId, categoryId, qty, itemName } = await request.json();
  const item = await prisma.frequentItem.update({
    where: {
      id: params.id || undefined,
    },
    data: {
      userId: '1',
      branchId,
      categoryId,
      quantity: qty,
      itemName,
    },
  });
  return NextResponse.json(item, { status: 200 });
}
