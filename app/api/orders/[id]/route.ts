import { prisma } from '@/lib/prisma';
import { sendOrderUpdate } from '@/lib/pusher';
import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis/redis';

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
    // Separate existing orderLines (those with an 'id') from new ones (those without 'id')
    const existingOrderLines = body.orderLines?.filter((line: any) => line.id);
    const newOrderLines = body.orderLines?.filter((line: any) => !line.id);

    // Update the order using Prisma
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

          // Create new orderLines
          create: newOrderLines?.map((line: any) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
          })),
        },
      },
      include: {
        orderLines: true, // Include orderLines in the response
        payment: true,   
      },
    });

    
    const cacheKeys = [
      body.branchId ? `orders-${body.branchId}` : null,
      body.companyId ? `orders-${body.companyId}` : null,
      body.waiterId ? `orders-${body.waiterId}` : null,
    ].filter(Boolean);

    
    await sendOrderUpdate(updatedOrder);

   
    console.log(`Deleting cache for branchId: ${body.branchId}, companyId: ${body.companyId}, waiterId: ${body.waiterId}`);
    console.log("Cache keys to delete:", cacheKeys);

    for (let key of cacheKeys) {
      console.log("Deleting cache key:", key);
      await redis.del(key as string);
    }

    // Return the updated order as the response
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

