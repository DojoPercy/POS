import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params; 
    const users = await prisma.order.findUnique({
      where: { id }, 
    });

    return NextResponse.json(users, { status: 200 }); 
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const { field, value } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { [field]: value }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}