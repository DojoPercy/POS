import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { expenseOperations } from "@/lib/expense";

export async function POST(request: Request) {
    const body = await request.json();

    if (body.queryType === expenseOperations.getExpenseSumByDateRange) {
        const response = await prisma.expense.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                date: {
                    gte: body.from,
                    lte: body.to,
                },
            },
        })

        return NextResponse.json(response._sum.amount)
    }
}