import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    if (body.queryType === "read" && "startDate" in body && "endDate" in body) {
        const payments = await prisma.payment.findMany({
            where: {
                paymentDate: {
                    gte: body.startDate,
                    lte: body.endDate,
                }
            },
        });

        for (let payment of payments) {
            const paymentDate = new Date(payment.paymentDate);
            ;(payment as any).paymentDate = paymentDate.toLocaleDateString("id");
        }
        return NextResponse.json(payments);
    }
}