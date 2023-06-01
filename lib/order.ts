export enum orderOperations{
    getOrderById,
    getOrderCountByDateRange,
    getOrderRevenueByDateRange,
    getOrderIncomeByDateRange,
    getOrderSummaryByDateRange,
    getOrdersByDateRange,
    updateOrderById,
}

type orderSummary = {
    orderedDate: Date
    discount: number
    rounding: number
    orderLine: {
        quantity: number
        buyUnitPrice: number
        sellUnitPrice: number
    }
}

export async function getOrders() {
    const res = await fetch(`api/orders`, {
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderById(orderId: string) {
    const query = {
        queryType: orderOperations.getOrderById,
        orderId: orderId,
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderCountByDateRange(from: Date, to: Date) {
    console.log("DATERNGE KEPANGGIL WOY")
    const query = {
        queryType: orderOperations.getOrderCountByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderRevenueByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderRevenueByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderIncomeByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderIncomeByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}

export async function getOrderSummaryByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderSummaryByDateRange,
        from: from,
        to: to,
    }
    const res: orderSummary = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());



    return res;
}

export async function getOrdersByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrdersByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    console.log(res)
    return res;
}

export async function updateOrderById(order: Order) {
    const query = {
        queryType: orderOperations.updateOrderById,
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
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}
