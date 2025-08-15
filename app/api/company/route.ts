import { DecodedToken } from '@/lib/types/types';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import redis from '@/lib/redis/redis';
import { clearCompanyFromIndexedDB } from '@/lib/dexie/actions';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const decodedToken: DecodedToken = jwtDecode(token);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    const cacheKey = `company:${companyId}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('cachedData Company');
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }
    // if (cachedData) {
    //   console.log("cachedData Company", cachedData)
    //   return NextResponse.json(JSON.parse(cachedData), { status: 200 })
    // }

    if (companyId) {
      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });
      if (!company) {
        return NextResponse.json(
          { message: 'Company not found' },
          { status: 404 }
        );
      }

      await redis.set(cacheKey, JSON.stringify(company), 'EX', 60 * 60);
      return NextResponse.json(company, { status: 200 });
    }
    const companies = await prisma.company.findMany({
      where: {
        ownerId: decodedToken.userId,
      },
    });

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      location,
      city,
      state,
      country,
      logo,
      ownerId,
      currency,
      taxRate,
      enableDiscount,
      paymentMethods,
      orderProcessingMode,
      subcriptionPlan,
    } = await req.json();
    const company = await prisma.company.create({
      data: {
        name,
        location,
        logo: logo ?? null, // Ensure it is either null or a string
        city,
        state,
        country,
        currency: currency || 'USD',
        taxRate: taxRate ?? 0.0,
        enableDiscount: enableDiscount ?? false,
        isActivated: false,
        paymentMethods: paymentMethods || ['cash', 'card'],
        orderProcessingMode: orderProcessingMode || 'retail',
        owner: {
          connect: { id: ownerId },
        },
      },
    });

    await prisma.user.update({
      where: { id: ownerId },
      data: { companyId: company.id },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActivated } = body;

    const company = await prisma.company.update({
      where: {
        id: id,
      },
      data: {
        isActivated: isActivated,
      },
    });
    await clearCompanyFromIndexedDB();
    await redis.del(`company:${id}`); // Invalidate the cache for this company
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
