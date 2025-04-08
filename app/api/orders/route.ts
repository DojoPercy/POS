import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { sendOrderUpdate } from '@/lib/pusher';
import redis from '@/lib/redis/redis';


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
      return NextResponse.json({ error: 'branchId, companyId, or waiterId is required' }, { status: 400 });
    }

    
    const cacheKeys = [
      branchId ? `orders-${branchId}` : null,
      companyId ? `orders-${companyId}` : null,
      waiterId ? `orders-${waiterId}` : null,
    ].filter(Boolean);

    
    for (let key of cacheKeys) {
      const cachedOrders = await redis.get(key as string);
      if (cachedOrders) {
        return NextResponse.json(JSON.parse(cachedOrders), { status: 200 });
      }
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
      },
    });

   
    for (let key of cacheKeys) {
      await redis.set(key as string, JSON.stringify(orders), 'EX', 60 * 5); 
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}






export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decodedToken: DecodedToken = jwtDecode(token);
   
    const {
      waiterId,
      branchId,
      orderLines = [], 
      totalPrice,
      discount,
      rounding,
      finalPrice,
      OrderStatus,
      orderStatus,
      requiredDate,
      orderNumber,
    } = await req.json();

    const orderData = {
      waiterId,
      branchId: branchId,
      companyId: decodedToken.companyId || "",
      totalPrice,
      discount,
      rounding,
      finalPrice,
      orderStatus: OrderStatus || orderStatus,
      requiredDate,
      orderNumber: orderNumber,
    };

 
    if (orderLines && orderLines.length > 0) {
      Object.assign(orderData, {
        orderLines: {
          create: orderLines.map(
            (line: { menuItemId: string; quantity: number; price: number; totalPrice: number; notes?: string }) => ({
              menuItemId: line.menuItemId,
              quantity: line.quantity,
              price: line.price,
              totalPrice: line.totalPrice,
              notes: line.notes,
            })
          ),
        },
      });
    }

    console.log("Creating order with data:", orderData);
    const newOrder = await prisma.order.create({
      data: orderData,
      include: { orderLines: true },
    });

    
    const cacheKeys = [
      branchId ? `orders-${branchId}` : null,
      decodedToken.companyId ? `orders-${decodedToken.companyId}` : null,
      waiterId ? `orders-${waiterId}` : null,
    ].filter(Boolean);

    
    for (let key of cacheKeys) {
      await redis.del(key as string);
    }

    
    await sendOrderUpdate(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
