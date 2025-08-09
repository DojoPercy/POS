import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { sendOrderUpdate } from '@/lib/pusher';
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

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  console.log('Start Date:', start);
  console.log('End Date:', end);

  const id = branchId || companyId || waiterId;
  const startStr = start ? start.toISOString().split('T')[0] : 'any';
  const endStr = end ? end.toISOString().split('T')[0] : 'any';

  if (!id) {
    return NextResponse.json(
      { error: 'branchId, companyId, or waiterId is required' },
      { status: 400 },
    );
  }

  const cacheKey = `orders-${id}-${startStr}-${endStr}`;
  console.log('Cache Key:', cacheKey);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
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
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                categoryId: true,
                imageUrl: true,
              },
            }, // Include menu item details
          },
        },
      },
    });
    console.log('Fetched orders:', orders.length);

    await redis.set(cacheKey, JSON.stringify(orders), 'EX', 60 * 1);

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));

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
      payment, // New payment data for automatic payment creation
    } = await req.json();

    const status = OrderStatus || orderStatus;
    const companyId = decodedToken.companyId || '';

    const orderData = {
      waiterId,
      branchId,
      companyId,
      totalPrice,
      discount,
      rounding,
      finalPrice,
      orderStatus: status,
      requiredDate,
      orderNumber,
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
    };

    const newOrder = await prisma.order.create({
      data: orderData,
      include: { orderLines: true },
    });

    // If order is PAID, automatically create payment record
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

    // Invalidate cache
    const idsToInvalidate = [branchId, companyId, waiterId].filter(Boolean);
    for (const id of idsToInvalidate) {
      const keys = await redis.keys(`orders-${id}-*`);
      if (keys.length > 0) await redis.del(...keys);
    }
    console.log('sratus', status);
    // Inventory deduction only if status is PAID
    if (status === 'PAID' && newOrder.orderLines.length > 0) {
      // Group ingredient deductions by ingredientId and branchId
      const ingredientDeductions = new Map<string, number>(); // Key: `${ingredientId}-${branchId}`, Value: totalDeductQty
      console.log('Deducting inventory for order:', newOrder.id);

      for (const line of newOrder.orderLines) {
        // Since orderLines from Prisma do not include orderType or ingredientId,
        // we infer orderType based on the presence of ingredientId.
        const isIngredientOrder = !!line.ingredientId;
        if (isIngredientOrder) {
          // Direct ingredient order - deduct the ingredient directly
          const deductQty = line.quantity;
          const key = `${line.ingredientId}-${branchId}`;
          ingredientDeductions.set(
            key,
            (ingredientDeductions.get(key) || 0) + deductQty,
          );
        } else {
          // Menu item order - deduct ingredients based on recipe
          const ingredients = await prisma.menuIngredient.findMany({
            where: { menuId: line.menuItemId },
            select: { ingredientId: true, amount: true },
          });

          for (const ingredient of ingredients) {
            const deductQty = ingredient.amount * line.quantity;
            const key = `${ingredient.ingredientId}-${branchId}`;
            ingredientDeductions.set(
              key,
              (ingredientDeductions.get(key) || 0) + deductQty,
            );
          }
        }
      }

      // Prepare a single batch update for inventory
      const inventoryUpdates = Array.from(ingredientDeductions.entries()).map(
        ([key, totalDeductQty]) => {
          const [ingredientId, targetBranchId] = key.split('-');
          return prisma.inventoryStock.updateMany({
            where: {
              ingredientId: ingredientId,
              branchId: targetBranchId,
            },
            data: {
              quantity: {
                decrement: totalDeductQty,
              },
            },
          });
        },
      );

      // Run all inventory updates in a single transaction
      if (inventoryUpdates.length > 0) {
        await prisma.$transaction(inventoryUpdates);
      }
    }
    await sendOrderUpdate(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
