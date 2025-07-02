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
  const startDate = searchParams.get('from');
  const endDate = searchParams.get('to');

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  console.log("Start Date:", start);
  console.log("End Date:", end);

  const id = branchId || companyId || waiterId;
  const startStr = start ? start.toISOString().split("T")[0] : "any";
  const endStr = end ? end.toISOString().split("T")[0] : "any";

  if (!id) {
    return NextResponse.json(
      { error: 'branchId, companyId, or waiterId is required' },
      { status: 400 }
    );
  }

  const cacheKey = `orders-${id}-${startStr}-${endStr}`;
  console.log("Cache Key:", cacheKey);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit:", cacheKey);
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    const orders = await prisma.order.findMany({
      where: {
        branchId: branchId || undefined,
        companyId: companyId || undefined,
        waiterId: waiterId || undefined,
        createdAt: {
          gte: start || undefined,
          lte: end || undefined,
        },
      },
      include: {
        branch: true,
        orderLines: {
          include: {
            menuItem: true, // Include menu item details
          },
        },
        
      },
    });
    console.log("Fetched orders:", orders.length);

    await redis.set(cacheKey, JSON.stringify(orders), 'EX', 60 * 1);

    return NextResponse.json(orders, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
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
      branchId,
      companyId: decodedToken.companyId || "",
      totalPrice,
      discount,
      rounding,
      finalPrice,
      orderStatus: OrderStatus || orderStatus,
      requiredDate,
      orderNumber,
    };

    if (orderLines && orderLines.length > 0) {
      Object.assign(orderData, {
        orderLines: {
          create: orderLines.map(
            (line: {
              menuItemId: string;
              quantity: number;
              price: number;
              totalPrice: number;
              notes?: string;
            }) => ({
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

    // ✅ Clear all related cache keys (including full keys with dates)
    const idsToInvalidate = [
      branchId,
      decodedToken.companyId,
      waiterId,
    ].filter(Boolean);

    for (const id of idsToInvalidate) {
      const matchingKeys = await redis.keys(`orders-${id}-*`);
      if (matchingKeys.length > 0) {
        await redis.del(...matchingKeys);
      }
    }

    await sendOrderUpdate(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

