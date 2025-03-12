import { prisma } from "@/lib/prisma";
import { CreatePaymentRequest } from "@/lib/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body: Partial<CreatePaymentRequest> = await req.json();

        const payment = await prisma.payment.update({
            where: { id: params.id },
            data: body,
        });

        return NextResponse.json(payment, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.payment.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Payment deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}