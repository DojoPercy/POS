import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


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

export async function PUT(req: { json: () => PromiseLike<{ waiterId: any; branchId: any; orderLines: any; totalPrice: any; discount: any; rounding: any; finalPrice: any; isCompleted: any; isCheckedOut: any; requiredDate: any; }> | { waiterId: any; branchId: any; orderLines: any; totalPrice: any; discount: any; rounding: any; finalPrice: any; isCompleted: any; isCheckedOut: any; requiredDate: any; }; }, { params }: any) {
  const { id } = params;
  try {
    const { waiterId, branchId, orderLines, totalPrice, discount, rounding, finalPrice, isCompleted, isCheckedOut, requiredDate } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id },
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
          deleteMany: {}, // Clear old lines
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

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
