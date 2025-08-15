import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { CreatePaymentRequest } from '@/lib/types/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const companyId = searchParams.get('companyId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!branchId && !companyId) {
      return NextResponse.json(
        { error: 'branchId or companyId is required' },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        OR: [companyId ? { companyId } : {}, branchId ? { branchId } : {}],
        ...(from && to
          ? {
              paymentDate: {
                gte: new Date(from),
                lte: new Date(to),
              },
            }
          : {}),
      },
    });

    return NextResponse.json(payments, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePaymentRequest = await req.json();

    if (
      !body.orderId ||
      !body.amount ||
      !body.currency ||
      !body.paymentStatus ||
      !body.companyId ||
      !body.branchId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: body.orderId,
        amount: body.amount,
        currency: body.currency,
        paymentStatus: body.paymentStatus,
        companyId: body.companyId,
        branchId: body.branchId,
        paymentDate: new Date(),
        paymentMethod: body.paymentMethod || 'cash',
      },
    });

    console.log('Payment created:', payment);

    return NextResponse.json(payment, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
