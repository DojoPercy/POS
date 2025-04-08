import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { prisma } from '../../../lib/prisma';
import redis from '@/lib/redis/redis';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

// **Create a New Menu Item with PriceType**
export async function POST(req: NextRequest) {
  try {
   
    const { name, description, prices, categoryId, imageBase64, companyId } = await req.json();

    const newMenuItem = await prisma.menu.create({
      data: {
        name,
        description,
        imageBase64,
        company: { connect: { id: companyId } },
        category: { connect: { id: categoryId } },
        price: {
          create: prices.map((price: { name: string; price: number }) => ({
            name: price.name,
            price: price.price,
          })),
        },
      },
      include: {
        price: true, // Include prices in response
      },
    });

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// **Get Menu Items with Prices**
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId') || "";

    const cachedKey = companyId ? `companyMenu-${companyId}` : `menu-${id}`;
    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
     
      return NextResponse.json(JSON.parse(cachedData), { status: 200 })
    }
    if (id) {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: { price: true, category: true },
      });
      if (!menu) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }
      await redis.set(cachedKey, JSON.stringify(menu), 'EX', 60 * 60);

      return NextResponse.json(menu, { status: 200 });
    } else if (companyId) {
      const menus = await prisma.menu.findMany({
        where: { companyId },
        include: { price: true, category: true },
      });
      await redis.set(cachedKey, JSON.stringify(menus), 'EX', 60 * 60);
      return NextResponse.json(menus, { status: 200 });
    }

    const menuItems = await prisma.menu.findMany({
      include: { price: true, category: true },
    });
    await redis.set(cachedKey, JSON.stringify(menuItems), 'EX', 60 * 60);
    return NextResponse.json(menuItems, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, prices, categoryId, imageBase64, companyId } = await req.json();

    const updatedMenuItem = await prisma.menu.update({
      where: { id },
      data: {
        name,
        description,
        imageBase64,
        companyId,
        category: { connect: { id: categoryId } },
        price: {
          deleteMany: { menuItemId: id }, // Remove old prices
          create: prices.map((price: { name: string; price: number }) => ({
            name: price.name,
            price: price.price,
          })),
        },
      },
      include: { price: true, category: true },
    });

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// **Delete Menu Item with Prices**
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Delete related price entries first
    await prisma.priceType.deleteMany({
      where: { menuItemId: id },
    });

    // Then delete the menu item
    const deletedMenuItem = await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json(deletedMenuItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
