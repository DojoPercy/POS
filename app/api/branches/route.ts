import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import redis from '@/lib/redis/redis';



interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
     
    const body = await req.json();
    console.log('Request Body:', body); 
   
    const newBranch = await prisma.branch.create({
      data: {
        name: body.name,
        location: body.location,
        company: {
          connect: { id: body.companyId || null }, 
        },
        city: body.city,
        state: body.state || null,
        country: body.country,
        openingHours: body.openingHours,
        status: body.status || 'active',
        managerId: body.managerId || null,
        createdBy: body.createdBy,
        imageUrl: body.imageUrl || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
      },
    });
    return NextResponse.json(newBranch, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /branches:', error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const cacheKey = companyId ? `company-${companyId}` : `branch-${id}`;
   
    if (id) {
      const branch = await prisma.branch.findUnique({
        where: { id },
      });
      if (!branch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }
     
      return NextResponse.json(branch, { status: 200 });
    }
    if (companyId) {
      const branches = await prisma.branch.findMany({
        where: { companyId },
      });
      
      return NextResponse.json(branches, { status: 200 });
    }

    const branches = await prisma.branch.findMany();
    
    return NextResponse.json(branches, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedBranch, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Branch deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
