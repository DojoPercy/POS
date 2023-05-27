import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const products = await prisma.product.findMany({
        include: {
            productCategory: true
        }
    });
    return NextResponse.json(products);
}