import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const { from, to } = await req.json();

    const totalAmount = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        companyId: companyId || undefined,
        branchId: branchId || undefined,
        dateAdded: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    return NextResponse.json({ totalAmount: totalAmount._sum.amount || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching total amount" }, { status: 500 });
  }
}

// 🔹 Get total count of expenses in a date range
