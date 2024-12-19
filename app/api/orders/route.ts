import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');

  try {
    const orders = await prisma.order.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        orderLines: true,
        payment: true,   
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { waiterId, branchId, orderLines, totalPrice, discount, rounding, finalPrice, isCompleted, isCheckedOut, requiredDate } = await req.json();

    const newOrder = await prisma.order.create({
      data: {
        waiterId,
        branchId,
        totalPrice,
        discount,
        rounding,
        finalPrice,
        isCompleted,
        isCheckedOut,
        requiredDate,
        orderLines: {
          create: orderLines.map((line: { menuItemId: any; quantity: any; price: any; totalPrice: any; }) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
          })),
        },
      },
      include: {
        orderLines: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
