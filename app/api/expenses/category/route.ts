import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../../lib/types/types';


const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
   const token = req.cookies.get("token")?.value
                 if (!token) {
                   return NextResponse.redirect(new URL("/login", req.url))
                 }
                 const decodedToken: DecodedToken = jwtDecode(token)
                const { searchParams } = new URL(req.url);
                const branchId = searchParams.get('branchId');
           

    const categories = await prisma.category.findMany({
        where:{
            branchId: decodedToken.branchId || undefined,
        },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { name , branchId} = json

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        branchId,
        name,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 })
    }

    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Error creating category" }, { status: 500 })
  }
}

