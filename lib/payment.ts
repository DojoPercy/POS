export enum paymentOperations{
    getPaymentSumByDateRange,
}

export async function getPaymentSumByDateRange(from: Date, to: Date) {
    const query = {
        queryType: paymentOperations.getPaymentSumByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}
