import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const employees = await prisma.employee.findMany({
        orderBy: {
            id: "asc"
        }
    });
    console.log(employees);
    return NextResponse.json(employees);
}