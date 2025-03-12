import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { CreatePaymentRequest } from '@/lib/types/types';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const branchId = searchParams.get('branchId');
        const companyId = searchParams.get('companyId');

        if (!branchId && !companyId) {
            return NextResponse.json({ error: 'branchId or companyId is required' }, { status: 400 });
        }

        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    companyId ? { companyId } : {},
                    branchId ? { branchId } : {}
                ],
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

        if (!body.orderId || !body.paymentTypeId || !body.amount || !body.currency || !body.paymentStatus || !body.companyId || !body.branchId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const payment = await prisma.payment.create({
            data: {
                orderId: body.orderId,
                paymentTypeId: body.paymentTypeId,
                amount: body.amount,
                currency: body.currency,
                paymentStatus: body.paymentStatus,
                companyId: body.companyId,
                branchId: body.branchId,
                paymentDate: new Date(),
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



