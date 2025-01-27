import { PrismaClient } from "@prisma/client"
import { jwtDecode } from "jwt-decode"
import { type NextRequest, NextResponse } from "next/server"

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  [key: string]: any
}

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const decodedToken: DecodedToken = jwtDecode(token)

    const companies = await prisma.company.findMany({
      where: {
        ownerId: decodedToken.userId,
      },
    })
    return NextResponse.json(companies, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const decodedToken: DecodedToken = jwtDecode(token)

    const { name, location, city, state, country, logo } = await req.json()
    const company = await prisma.company.create({
      data: {
        name,
        location,
        logo,
        city,
        state,
        country,
        owner: {
          connect: {
            id: decodedToken.userId,
          },
        },
      },
    })

  await prisma.user.update({
          where: { id: decodedToken.userId },
          data: { companyId: company.id }
        });
        
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error }, { status: 500 })
  }
}

