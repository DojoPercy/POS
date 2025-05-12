import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const branchId = searchParams.get('branchId');
        const ingredientId = searchParams.get('ingredientId');

        if (id) {
            const ingredient = await prisma.inventoryStock.findUnique({
                where: { id },
            });
            return NextResponse.json(ingredient);
        }

        if (ingredientId && branchId) {
            const stock = await prisma.inventoryStock.findUnique({
                where: {
                    ingredientId_branchId: {
                        ingredientId,
                        branchId,
                    },
                },
                include: {
                    ingredient:true
                }
            });
            return NextResponse.json(stock);
        }

        if (ingredientId) {
            const stock = await prisma.inventoryStock.findFirst({
                where: { ingredientId },
                include: {
                    ingredient:true
                }
            });
            return NextResponse.json(stock);
        }

        if (branchId) {
            const ingredients = await prisma.inventoryStock.findMany({
                where: { branchId },
                include: {
                    ingredient:true
                }
            });
            return NextResponse.json(ingredients);
        }

        return new NextResponse('No id, ingredientId or branchId provided', { status: 400 });

    } catch (error) {
        console.log(error);
        return new NextResponse(`Error with Getting Ingredient: ${error}`, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ingredientId, branchId, quantity }: { ingredientId: string; branchId: string; quantity: number } = body;

        if (!ingredientId || !branchId || quantity === undefined) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const existingStock = await prisma.inventoryStock.findUnique({
            where: {
                ingredientId_branchId: {
                    ingredientId,
                    branchId,
                },
            },
        });

        if (existingStock) {
            const updatedStock = await prisma.inventoryStock.update({
                where: {
                    ingredientId_branchId: {
                        ingredientId,
                        branchId,
                    },
                },
                data: {
                    quantity: existingStock.quantity + quantity,
                },
            });

            return NextResponse.json(updatedStock, { status: 200 });
        }

        const newStock = await prisma.inventoryStock.create({
            data: {
                ingredientId,
                branchId,
                quantity,
            },
        });

        return NextResponse.json(newStock, { status: 201 });

    } catch (error) {
        console.error(error);
        return new NextResponse(`Error creating/updating inventory: ${error}`, { status: 500 });
    }
}



export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return new NextResponse('No id provided', { status: 400 });
        }
        const deletedStock = await prisma.inventoryStock.delete({
            where: {
                id,
            },
        });
        return NextResponse.json(deletedStock, { status: 200 });
    } catch (error) {
        console.log(error);
        return new NextResponse(`Error with Deleting Stock: ${error}`, { status: 500 });
    }
}