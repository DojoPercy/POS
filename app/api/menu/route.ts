
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
      const { name, description, price, category, imageBase64 } = await req.json();
  
      const newMenuItem = await prisma.menu.create({
        data: {
          name,
          description,
          price,
          imageBase64,
          category,
        },
      });
  
      return NextResponse.json(newMenuItem, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  export async function GET(req: NextRequest){
    try{
       const { searchParams } = new URL(req.url);
          const id = searchParams.get('id');
      
          if (id) {
            const branch = await prisma.branch.findUnique({
              where: { id },
            });
            if (!branch) {
              return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
            }
            return NextResponse.json(branch, { status: 200 });
          }
      const menuItems = await prisma.menu.findMany();
      return NextResponse.json(menuItems, { status: 200 });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest){
    try{
      const { id, name, description, price, category, imageBase64 } = await req.json();
      const updatedMenuItem = await prisma.menu.update({
        where: { id },
        data: {
          name,
          description,
          price,
          imageBase64,
          category,
        },
      });
      return NextResponse.json(updatedMenuItem, { status: 200 });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  export async function DELETE(req: NextRequest){
    try{
      const { id } = await req.json();
      const deletedMenuItem = await prisma.menu.delete({
        where: { id },
      });
      return NextResponse.json(deletedMenuItem, { status: 200 });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

 