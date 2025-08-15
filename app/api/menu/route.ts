import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { prisma } from '../../../lib/prisma';
import redis from '@/lib/redis/redis';
import { MenuIngredients } from '../../start/business-setup/components/menu-indregients';

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
    const {
      name,
      description,
      prices,
      categoryId,
      imageBase64,
      companyId,
      imageUrl,
      ingredientId,
    } = await req.json();

    const newMenuItem = await prisma.menu.create({
      data: {
        name,
        description,
        imageBase64,
        imageUrl,

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
        price: true,
      },
    });
    const singleItemCacheKey = `menu-${newMenuItem.id}`;
    const companyMenuCacheKey = companyId ? `companyMenu-${companyId}` : null;

    await redis.del(singleItemCacheKey);

    if (companyMenuCacheKey) {
      await redis.del(companyMenuCacheKey);
    }
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
    const companyId = searchParams.get('companyId') || '';

    const cachedKey = companyId ? `companyMenu-${companyId}` : `menu-${id}`;
    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }
    if (id) {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: { price: true, category: true, ingredients: true },
      });
      if (!menu) {
        return NextResponse.json(
          { error: 'Menu item not found' },
          { status: 404 }
        );
      }
      await redis.set(cachedKey, JSON.stringify(menu), 'EX', 60 * 60);

      return NextResponse.json(menu, { status: 200 });
    } else if (companyId) {
      const menus = await prisma.menu.findMany({
        where: { companyId },
        include: {
          price: true,
          category: true,
          ingredients: {
            include: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
      await redis.set(cachedKey, JSON.stringify(menus), 'EX', 60 * 60);
      console.log('Company Menu Cache Key:', cachedKey, menus);
      return NextResponse.json(menus, { status: 200 });
    }

    const menuItems = await prisma.menu.findMany({
      include: { price: true, category: true, ingredients: true },
    });
    await redis.set(cachedKey, JSON.stringify(menuItems), 'EX', 60 * 60);
    return NextResponse.json(menuItems, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      name,
      description,
      prices,
      categoryId,
      imageBase64,
      companyId,
      imageUrl,
    } = await req.json();

    // Update the menu item
    const updatedMenuItem = await prisma.menu.update({
      where: { id },
      data: {
        imageUrl,
        imageBase64,
      },
      include: {
        price: true,
        category: true,
      },
    });

    const singleItemCacheKey = `menu-${id}`;
    const companyMenuCacheKey = companyId ? `companyMenu-${companyId}` : null;

    await redis.del(singleItemCacheKey);

    if (companyMenuCacheKey) {
      await redis.del(companyMenuCacheKey);
    }

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error: any) {
    console.error('Update Menu Error:', error);
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
