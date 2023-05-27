import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const orders = await prisma.order.findMany({
        include: {
            employee: {
                select: {
                    name: true
                }
            },
            customer: {
                select: {
                    name: true
                }
            },
            orderLine: true,
            payment: true
        },
        orderBy: {
            id: "asc",
        }
    });

    for (let order of orders) {
        let orderTotal = 0;
        for (let line of order.orderLine){
            orderTotal += line.quantity * line.sellUnitPrice;
        }
        ;(order as any).orderTotal = orderTotal;

        let paymentTotal = 0;
        for (let payment of order.payment) {
            paymentTotal += payment.amount;
        }
        ;(order as any).paymentTotal = paymentTotal;

        ;(order as any).paid = (orderTotal - order.discount + order.rounding === paymentTotal ? "Full" : (paymentTotal === 0 ? "None" : "Partial"));

        const orderedDate = new Date(order.orderedDate);
        ;(order as any).orderedDate = orderedDate.toLocaleString("id").replaceAll(".", ":");

        const requiredDate = new Date(order.requiredDate);
        ;(order as any).requiredDate = requiredDate.toLocaleString("id").replaceAll(".", ":");
    }

    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    const body = await request.json();

    if (body.queryType === "read" && "orderId" in body) {
        const order = await prisma.order.findUnique({
            where: {
                id: body.orderId,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                orderLine: {
                    include: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                payment: {
                    include: {
                        paymentType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        let orderTotal = 0;
        for (let line of order.orderLine) {
            orderTotal += line.quantity * line.sellUnitPrice;
        }
        ;(order as any).orderTotal = orderTotal;

        let paymentTotal = 0;
        for (let payment of order.payment) {
            paymentTotal += payment.amount;
        }
        ;(order as any).paymentTotal = paymentTotal;

        const orderedDate = new Date(order.orderedDate);
        ;(order as any).orderedDate = orderedDate.toLocaleString("id").replaceAll(".", ":");

        const requiredDate = new Date(order.requiredDate);
        ;(order as any).requiredDate = requiredDate.toLocaleString("id").replaceAll(".", ":");

        for (let payment of order.payment) {
            const date = new Date(payment.paymentDate);
            ;(payment as any).paymentDate = date.toLocaleString("id").replaceAll(".", ":");
        }
    
        console.log(order);
        return NextResponse.json(order);
    }

    if (body.queryType === "read" && "startDate" in body && "endDate" in body) {
        const orders = await prisma.order.findMany({
            where: {
                orderedDate: {
                    gte: body.startDate,
                    lte: body.endDate,
                }
            },
            include: {
                orderLine: true,
                payment: true,
            },
        });

        console.log(new Date(body.startDate));
        console.log(new Date(body.endDate));

        for (let order of orders) {
            let orderTotal = 0;
            let orderIncome = 0;
            for (let line of order.orderLine){
                orderTotal += line.quantity * line.sellUnitPrice;
                orderIncome += line.quantity * line.buyUnitPrice;
            }
            ;(order as any).orderTotal = orderTotal;
            ;(order as any).orderIncome = orderIncome;
    
            const orderedDate = new Date(order.orderedDate);
            ;(order as any).orderedDate = orderedDate.toLocaleDateString("id");
        }
        return NextResponse.json(orders);
    }


    if (body.queryType === "update") {
        const update = await prisma.order.update({
            where: {
                id: body.order.id,
            },
            data: {
                employeeId: body.order.employeeId,
                customerId: body.order.customerId,
            },
        });
        console.log("lalala");
        console.log(update);
        console.log("lilili");

        return NextResponse.json(update);
    }
}