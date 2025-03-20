import { prisma } from '@/lib/prisma';
import { sendOrderUpdate } from '@/lib/pusher';
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
     
    const existingOrderLines = body.orderLines?.filter((line: any) => line.id);
    const newOrderLines = body.orderLines?.filter((line: any) => !line.id);

    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        totalPrice: body.totalPrice,
        discount: body.discount,
        rounding: body.rounding,
        finalPrice: body.finalPrice,
        orderStatus: body.orderStatus,
        updatedAt: new Date(),
        orderLines: {
          // Update existing orderLines
          update: existingOrderLines?.map((line: any) => ({
            where: { id: line.id },
            data: {
              quantity: line.quantity,
              price: line.price,
              totalPrice: line.totalPrice,
            },
          })),

          
          create: newOrderLines?.map((line: any) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
          })),
        },
      },
      include: {
        orderLines: true,
        payment: true,
      },
    });
   await sendOrderUpdate(updatedOrder);
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

