import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import format from 'date-fns/format/index.js';
import { ObjectId } from 'mongodb';
import { OrderStatus } from '../../../lib/enums/enums';

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
  const waiterId = searchParams.get('waiterId');

  try {
    

    if (!branchId && !companyId && !waiterId) {
      return NextResponse.json({ error: 'branchId or companyId is required' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        branchId: branchId || undefined,
        companyId: companyId || undefined,
        waiterId: waiterId || undefined,
      },
      include: {
        branch: true,
        orderLines: true,
        payment: true,
      },
    });

    
    return NextResponse.json(orders, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




export async function POST(req: NextRequest) {
  try {
    // Check for authentication token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Decode token
    const decodedToken: DecodedToken = jwtDecode(token);

    // Parse request body
    const {
      waiterId,
      branchId,
      orderLines,
      totalPrice,
      discount,
      rounding,
      finalPrice,
      OrderStatus,
      requiredDate,
      orderNumber
    } = await req.json();

    // Normalize today's date to midnight
  

    // Create order in the database
    const newOrder = await prisma.order.create({
      data: {
       
        waiterId,
        branchId: branchId,
        companyId: decodedToken.companyId || "",
        totalPrice,
        discount,
        rounding,
        finalPrice,
        orderStatus: OrderStatus,
        requiredDate,
        orderNumber: orderNumber,
        orderLines: {
          create: orderLines.map((line: { menuItemId: string; quantity: number; price: number; totalPrice: number }) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
          })),
        },
      },
      include: { orderLines: true }, // Include order lines in response
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}