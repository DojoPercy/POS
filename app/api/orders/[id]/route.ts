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
