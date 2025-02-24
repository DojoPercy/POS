import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { branchId, date } = await req.json();
      if (!branchId || !date) {
        return NextResponse.json({ error: "Invalid BranchId" }, { status: 400 });
      }

      // Normalize date to midnight
      const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

  

    // ✅ Use upsert to atomically check and update or create
    const orderCounter = await prisma.orderCounter.upsert({
      where: { branchId_date: { branchId, date: formattedDate } }, // Ensure this matches Prisma schema
      update: { lastNumber: { increment: 1 } }, // Increment lastNumber
      create: { branchId, date: formattedDate, lastNumber: 1 }, // Create new if not found
    });

    return NextResponse.json(orderCounter, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "error.message" }, { status: 500 });
  }
  } else if (req.method === "GET") {
    
  } else {
    
  }
}
