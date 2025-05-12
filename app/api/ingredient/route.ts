import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET( req: NextRequest){
    try {
        const {searchParams} = new URL(req.url);
        const id = searchParams.get('id');
        const companyId = searchParams.get('companyId');

        if(id){
            const ingredient = await  prisma.ingredient.findUnique({
                where: {
                    id: id,
                },
            })
        }
        if(companyId){
            const ingredients = await  prisma.ingredient.findMany({
                where: {
                    companyId: companyId,
                },
            })
            return NextResponse.json(ingredients);
        }
        if(!id && !companyId){
        return new NextResponse('No id or companyId provided', { status: 400 });
        }
        return NextResponse.json({message: 'No id or companyId provided'}, { status: 400 });


        
    } catch (error) {
        console.log(error);
        return new NextResponse(`Error with Geeting Ingredient: ${error}`, { status: 500 });
        
    }
}


export async function POST(req: NextRequest){
    try {
        const body = await req.json();

        const {name , unit, companyId} : {name: string, unit: string, companyId: string} = body;

        if(!name || !unit || !companyId){
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const newIngredient = await prisma.ingredient.create({
            data: {
                name,
                unit,
                companyId,
            },
        });
        return NextResponse.json(newIngredient, { status: 200 });


        
    } catch (error) {
        NextResponse.json({message: `Error with Creating Ingredient: ${error}`}, { status: 500 });
    }
}


export async function PUT(req: NextRequest){
    try {
        const body = await req.json();

        const {id, name , unit, companyId} : {id: string, name: string, unit: string, companyId: string} = body;

        if(!id || !name || !unit || !companyId){
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const updatedIngredient = await prisma.ingredient.update({
            where: {
                id,
            },
            data: {
                name,
                unit,
                companyId,
            },
        });
        return NextResponse.json(updatedIngredient, { status: 200 });


        
    } catch (error) {
        NextResponse.json({message: `Error with Updating Ingredient: ${error}`}, { status: 500 });
    }
}


export async function DELETE(req: NextRequest){
    try {
        const body = await req.json();

        const {id} : {id: string} = body;

        if(!id){
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const deletedIngredient = await prisma.ingredient.delete({
            where: {
                id,
            },
        });
        return NextResponse.json(deletedIngredient, { status: 200 });


        
    } catch (error) {
        NextResponse.json({message: `Error with Deleting Ingredient: ${error}`}, { status: 500 });
    }
}
