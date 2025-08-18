import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderUpdate } from '@/lib/pusher';
import { jwtDecode } from 'jwt-decode';
import redis from '@/lib/redis/redis';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');
  const companyId = searchParams.get('companyId');
  const waiterId = searchParams.get('waiterId');
  const startDate = searchParams.get('from');
  const endDate = searchParams.get('to');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const id = branchId || companyId || waiterId;
  const startStr = start ? start.toISOString().split('T')[0] : 'any';
  const endStr = end ? end.toISOString().split('T')[0] : 'any';

  if (!id) {
    return NextResponse.json(
      { error: 'branchId, companyId, or waiterId is required' },
      { status: 400 }
    );
  }

  const cacheKey = `orders-${id}-${startStr}-${endStr}-${page}-${limit}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
          company: true,
          orderLines: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  categoryId: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          branchId: branchId || undefined,
          companyId: companyId || undefined,
          waiterId: waiterId || undefined,
          createdAt: {
            gte: start || undefined,
            lte: end || undefined,
          },
        },
      }),
    ]);

    const response = {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decodedToken: DecodedToken | null = token ? jwtDecode(token) : null;

    const body = await req.json();
    const {
      companyId: bodyCompanyId,
      branchId,
      orderType,
      orderLines,
      totalPrice,
      customerInfo,
      deliveryInfo,
      waiterId,
      orderStatus,
      orderNumber,
      discount,
      rounding,
      finalPrice,
      OrderStatus,
      requiredDate,
      payment, // for payment auto-creation
      // Legacy fields
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
    } = body;

    // Determine companyId (from token or body)
    const companyId = decodedToken?.companyId || bodyCompanyId;

    if (!companyId || !branchId || !orderLines || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderLines) || orderLines.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Handle legacy format
    const finalOrderType = orderType || 'pickup';
    let finalCustomerInfo = customerInfo;
    const finalDeliveryInfo = deliveryInfo;

    if (!customerInfo && (customerName || customerPhone)) {
      finalCustomerInfo = {
        name: customerName || 'Walk-in Customer',
        phone: customerPhone || 'N/A',
        email: customerEmail,
        address: customerAddress,
      };
    }

    if (
      !finalCustomerInfo ||
      (!finalCustomerInfo.name && !finalCustomerInfo.phone)
    ) {
      return NextResponse.json(
        { error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    if (
      finalOrderType === 'delivery' &&
      (!finalDeliveryInfo || !finalDeliveryInfo.address)
    ) {
      return NextResponse.json(
        { error: 'Delivery address is required for delivery orders' },
        { status: 400 }
      );
    }

    // Create order
    const status = OrderStatus || orderStatus || 'PENDING';
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: orderNumber || generateOrderNumber(),
        waiterId:
          waiterId || decodedToken?.userId || '000000000000000000000000',
        companyId,
        branchId,
        orderType: finalOrderType,
        orderStatus: status,
        totalPrice,
        discount,
        rounding,
        finalPrice,
        requiredDate,
        customerName: finalCustomerInfo.name,
        customerPhone: finalCustomerInfo.phone,
        customerEmail: finalCustomerInfo.email,
        customerAddress: finalCustomerInfo.address,
        deliveryAddress: finalDeliveryInfo?.address,
        deliveryInstructions: finalDeliveryInfo?.instructions,
        deliveryLatitude: finalDeliveryInfo?.coordinates?.lat,
        deliveryLongitude: finalDeliveryInfo?.coordinates?.lng,
        orderLines: {
          create: orderLines.map((line: any) => ({
            menuItemId: line.menuItemId || null,
            ingredientId: line.ingredientId || null,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice,
            notes: line.notes,
            orderType: line.ingredientId ? 'INGREDIENT' : 'MENU_ITEM',
          })),
        },
      },
      include: { orderLines: true },
    });

    // Auto payment creation
    if (status === 'PAID' && payment) {
      await prisma.payment.create({
        data: {
          orderId: newOrder.id,
          date: new Date(),
          amount: payment.amount || finalPrice,
          paymentDate: new Date(),
          currency: payment.currency || 'GHS',
          paymentStatus: payment.paymentStatus || 'Completed',
          companyId: companyId,
          branchId: branchId,
          paymentMethod: payment.paymentMethod || 'cash',
        },
      });
    }

    // Inventory deduction for PAID orders
    if (status === 'PAID' && newOrder.orderLines.length > 0) {
      const ingredientDeductions = new Map<string, number>();

      for (const line of newOrder.orderLines) {
        if (line.ingredientId) {
          const key = `${line.ingredientId}-${branchId}`;
          ingredientDeductions.set(
            key,
            (ingredientDeductions.get(key) || 0) + line.quantity
          );
        } else if (line.menuItemId) {
          const ingredients = await prisma.menuIngredient.findMany({
            where: { menuId: line.menuItemId },
            select: { ingredientId: true, amount: true },
          });

          for (const ingredient of ingredients) {
            const key = `${ingredient.ingredientId}-${branchId}`;
            const deductQty = ingredient.amount * line.quantity;
            ingredientDeductions.set(
              key,
              (ingredientDeductions.get(key) || 0) + deductQty
            );
          }
        }
      }

      const inventoryUpdates = Array.from(ingredientDeductions.entries()).map(
        ([key, qty]) => {
          const [ingredientId, targetBranchId] = key.split('-');
          return prisma.inventoryStock.updateMany({
            where: { ingredientId, branchId: targetBranchId },
            data: { quantity: { decrement: qty } },
          });
        }
      );

      if (inventoryUpdates.length > 0) {
        await prisma.$transaction(inventoryUpdates);
      }
    }

    // Invalidate redis cache
    const idsToInvalidate = [branchId, companyId, waiterId].filter(Boolean);
    for (const id of idsToInvalidate) {
      const keys = await redis.keys(`orders-${id}-*`);
      if (keys.length > 0) await redis.del(...keys);
    }

    await sendOrderUpdate(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
