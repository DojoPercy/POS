type Statistic = {
    date: string,
    revenue: number,
    income: number,
    paymentsIn: number,
}

export function generateEmptyStatisticsByDate(startDate: Date, endDate: Date) {
    var currentDate = new Date(startDate.toISOString());
    var groupedArray: Statistic[] = []
    while(currentDate <= endDate) {
        var localDateOnly = currentDate.toLocaleDateString("id");

        groupedArray.push({
            date: localDateOnly,
            revenue: 0,
            income: 0,
            paymentsIn: 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }
    return groupedArray;
}

export async function getStatisticsByDate(startDate: Date, endDate: Date) {
    const utcStartDate = startDate;
    const utcEndDate = endDate;

    const query = {
        queryType: "read",
        startDate: utcStartDate,
        endDate: utcEndDate
    }

    const orderResponse = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((orderResponse) => orderResponse.json());

    const paymentResponse = await fetch(`api/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((paymentResponse) => paymentResponse.json());

    console.log(paymentResponse);

    var groupedRevenue: {
        [key: string]: number
    } = {};
    var groupedIncome: {
        [key: string]: number
    } = {};
    var groupedPaymentIn: {
        [key: string]: number
    } = {};

    for (var i = 0; i < orderResponse.length; i++) {
        if (orderResponse[i].orderedDate in groupedRevenue) {
            groupedRevenue[orderResponse[i].orderedDate] += orderResponse[i].orderTotal;
        }
        else {
            groupedRevenue[orderResponse[i].orderedDate] = orderResponse[i].orderTotal;
        }

        if (orderResponse[i].orderedDate in groupedIncome) {
            groupedIncome[orderResponse[i].orderedDate] += orderResponse[i].orderIncome;
        }
        else {
            groupedIncome[orderResponse[i].orderedDate] = orderResponse[i].orderIncome;
        }
    }

    for (var i = 0; i < paymentResponse.length; i++){
        if (paymentResponse[i].paymentDate in groupedPaymentIn) {
            groupedPaymentIn[paymentResponse[i].paymentDate] += paymentResponse[i].amount;
        }
        else {
            groupedPaymentIn[paymentResponse[i].paymentDate] = paymentResponse[i].amount;
        }
    }

    var currentDate = new Date(startDate.toISOString());
    var groupedArray: Statistic[] = []
    while(currentDate <= endDate) {
        var localDateOnly = currentDate.toLocaleDateString("id");

        groupedArray.push({
            date: localDateOnly,
            revenue: (localDateOnly in groupedRevenue ? groupedRevenue[localDateOnly] : 0),
            income: (localDateOnly in groupedIncome ? groupedIncome[localDateOnly] : 0),
            paymentsIn: (localDateOnly in groupedPaymentIn ? groupedPaymentIn[localDateOnly] : 0),
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(groupedArray);


    return groupedArray;
}

export async function getProductStatisticByDate(startDate: Date, endDate: Date) {
    const utcStartDate = startDate;
    const utcEndDate = endDate;

    const query = {
        queryType: "read",
        startDate: utcStartDate,
        endDate: utcEndDate
    }
    const orderResponse = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((orderResponse) => orderResponse.json());

    const productResponse = await fetch(`api/products`, {
    }).then((productResponse) => productResponse.json());

    var productData: {
        [key: string]: {
            [key:string]: number,
        }
    } = {};

    for (var i = 0; i < productResponse.length; i++) {
        productData[productResponse[i].name] = {
            revenue: 0,
            income: 0,
            sold: 0,
            orders: 0,
        }
    }

    for (var i = 0; i < orderResponse.length; i++) {
        for (var j = 0; j < orderResponse[i].orderLine.length; j++) {
            var orderLine = orderResponse[i].orderLine[j];
            productData[orderLine.product.name].revenue += orderLine.sellUnitPrice * orderLine.quantity;
            productData[orderLine.product.name].income += (orderLine.sellUnitPrice - orderLine.buyUnitPrice) * orderLine.quantity;
            productData[orderLine.product.name].sold += orderLine.quantity;
            productData[orderLine.product.name].orders += 1;
        }
    }

    return productData;
}