import { Order } from "@prisma/client";

export async function getOrders() {
    const res = await fetch(`api/orders`, {
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderById(orderId: string) {
    const orderQuery = {
        queryType: "read",
        orderId: orderId
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderQuery),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function updateOrderById(order: Order) {
    const orderQuery = {
        queryType: "update",
        order: {
            id: order.id,
            customerId: order.customerId,
            employeeId: order.employeeId,
            requiredDate: order.requiredDate,
        }
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderQuery),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}
