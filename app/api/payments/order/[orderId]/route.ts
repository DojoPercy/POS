import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { orderId }: { orderId: string }) {
    try {
        
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                branch: true,
                orderLines: true,
                payment: true,
            },
        });

        
        NextResponse.json(order, { status: 200 });
    } catch (error: any) {
        NextResponse.json({ error: error.message }, { status: 500 });
    }

}