
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';

const prisma = new PrismaClient();
interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}
export async function POST(req: NextRequest) {
    try {
      const token = req.cookies.get("token")?.value
              if (!token) {
                return NextResponse.redirect(new URL("/login", req.url))
              }
              const decodedToken: DecodedToken = jwtDecode(token)
      const { name, description, price, category, imageBase64 } = await req.json();
              console.log('company:', decodedToken);
      const newMenuItem = await prisma.menu.create({
        data: {
          name: name,
          description,
          
          price: price,
          imageBase64: imageBase64,
          company: {connect: {id: decodedToken.companyId}},
          category: category,
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
          const companyId = searchParams.get('companyId') || "";
      
          if (id) {
            const menu = await prisma.menu.findMany({
              where: { id },
            });
            if (!menu) {
              return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
            }
            return NextResponse.json(menu, { status: 200 });
          } else if(companyId){
            const menus = await prisma.menu.findMany({
              where: { companyId },
            });
            return NextResponse.json(menus, { status: 200 });
          }
      const menuItems = await prisma.menu.findMany();
      return NextResponse.json(menuItems, { status: 200 });

    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest){
    try{
      const { id, name, description, price, category, imageBase64, companyId } = await req.json();
      const updatedMenuItem = await prisma.menu.update({
        where: { id },
        data: {
          name,
          description,
          companyId: companyId || "",
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

 