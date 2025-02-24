import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET order by ID
export async function GET(req: any, { params }: any) {
  const { id } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderLines: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE order by ID
export async function DELETE(req: NextRequest, { params }: any) {
  const { id } = params;
  try {
    const deletedOrder = await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(deletedOrder, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update order by ID
export async function PUT(req: NextRequest, { params }: any) {
  const { id } = params;
  const body = await req.json();

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        isCheckedOut: body.isCheckedOut,
        isCompleted: body.isCompleted,
        totalPrice: body.totalPrice,
        finalPrice: body.finalPrice,
        orderLines: {
          create: body.orderLines.create, // 👈 Handling nested writes properly
        },
      },
      include: {
        orderLines: true,
        payment: true,
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

