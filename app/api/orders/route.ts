import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');
  const companyId = searchParams.get('companyId');
  const isCompletedParam = searchParams.get('isCompleted');

  try {
    
    const isCompleted =
      isCompletedParam === 'true' ? true : isCompletedParam === 'false' ? false : undefined;

    
   if(branchId){
    const orders = await prisma.order.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        branch: true,
        orderLines: true,
        payment: true,
      },
    });
    return NextResponse.json(orders, { status: 200 });
   } else if(companyId){
    const orders = await prisma.order.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        branch: true,
        orderLines: true,
        payment: true,
      },
    });
    return NextResponse.json(orders, { status: 200 });
   }

    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




export async function POST(req: NextRequest) {
  try {
      const token = req.cookies.get("token")?.value
            if (!token) {
              return NextResponse.redirect(new URL("/login", req.url))
            }
            const decodedToken: DecodedToken = jwtDecode(token)
    const { waiterId, branchId, orderLines, totalPrice, discount, rounding, finalPrice, isCompleted, isCheckedOut, requiredDate } = await req.json();

    const newOrder = await prisma.order.create({
      data: {
        waiterId,
        branchId,
        totalPrice,
        discount,
        companyId: decodedToken.companyId || "",
        rounding,
        finalPrice,
        isCompleted,
        isCheckedOut,
        requiredDate,
        orderLines: {
          create: orderLines.map((line: { menuItemId: any; quantity: any; price: any; totalPrice: any; }) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
          })),
        },
      },
      include: {
        orderLines: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
