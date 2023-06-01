export enum expenseOperations{
    getExpenseSumByDateRange,
}

export async function getExpenseSumByDateRange(from: Date, to: Date) {
    const query = {
        queryType: expenseOperations.getExpenseSumByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}
