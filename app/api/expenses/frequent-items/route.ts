import { NextRequest, NextResponse } from "next/server";
import {prisma} from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');
  const items = await prisma.frequentItem.findMany({
    where: {
      branchId: branchId ? { equals: branchId } : undefined,
    }
  });
  console.log(items)
  return NextResponse.json(items, { status: 200 });
}

export async function POST(request: Request) {
  const { name, branchId, categoryId, qty, itemName } = await request.json();
  const item = await prisma.frequentItem.create({
    data: {
      userId: branchId,
      branchId,
      categoryId: categoryId || undefined,
      quantity: qty || 1,
      itemName
    },
  });
  return Response.json(item);
}