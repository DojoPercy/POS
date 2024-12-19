import { Order, OrderLine } from "@prisma/client";


export enum orderOperations {
  getOrderById,
    getOrdersByBranchId,
    createOrder,
  getOrderCountByDateRange,
  getOrderRevenueByDateRange,
  getOrderIncomeByDateRange,
  getOrderSummaryByDateRange,
  getOrderProductsByDateRange,
  getOrdersByDateRange,
  updateOrderById,
}

type orderSummaryResponse = {
  orderedDate: string;
  discount: number;
  rounding: number;
  orderLine: {
    quantity: number;
    buyUnitPrice: number;
    sellUnitPrice: number;
  }[];
};

export type orderSummaryByDate = {
  date: string;
  sales: number;
  revenue: number;
  income: number;
};

export async function getOrders() {
  const res = await fetch(`/api/orders`, { cache: "no-store" });
  return res.json();
}

export async function createOrder(order: {
    waiterId?: string;
    branchId?: string;
    orderLines: {
      menuItemId: string;
      quantity: number;
      price: number;
      totalPrice: number;
    }[];
    totalPrice: number;
    discount: number;
    rounding: number;
    finalPrice: number;
    isCompleted: boolean;
    isCheckedOut: boolean;
    requiredDate: string;
  }) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  
    if (!res.ok) {
      throw new Error('Failed to create order');
    }
  
    return res.json();
  }

  
export async function getOrderById(orderId: string) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "GET",
    cache: "no-store",
  });
  return res.json();
}

  

export async function getOrderCountByDateRange(from: Date, to: Date, branchId?: string) {
  const query = {
    queryType: orderOperations.getOrderCountByDateRange,
    from,
    to,
  };
  const res = await fetch(`/api/orders?branchId=${branchId || ''}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
   
    cache: "no-store",
  }).then((res) => res.json());
  console.log(res.length);
  return res.length;
}

export async function getOrderRevenueByDateRange(from: Date, to: Date, branchId?: string) {
  const query = {
    queryType: orderOperations.getOrderRevenueByDateRange,
    from,
    to,
  };
  const res = await fetch(`/api/orders?branchId=${branchId || ''}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((res) => res.json());
  const totalRevenue = res.reduce((acc: number, order: any) => acc + order.finalPrice, 0);
  return totalRevenue;
}

export async function getOrderIncomeByDateRange(from: Date, to: Date) {
  const query = {
    queryType: orderOperations.getOrderIncomeByDateRange,
    from,
    to,
  };
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    cache: "no-store",
  }).then((res) => res.formData);
  console.log(res);
  return res;
}

export async function getOrderSummaryByDateRange(from: Date, to: Date, branchId?: string): Promise<any[]> {
  const query = {
    queryType: orderOperations.getOrderSummaryByDateRange,
    from,
    to,
    branchId,
  };

  const res = await fetch(`/api/orders?branchId=${branchId || ''}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((response) => response.json());

  console.log(res);
  const summary: Record<string, { sales: number; revenue: number; income: number }> = {};

  // Iterate through the fetched data to build the summary
  for (const order of res) {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];

    if (!summary[orderDate]) {
      summary[orderDate] = {
        sales: 0,
        revenue: 0,
        income: 0,
      };
    }

    for (const orderLine of order.orderLines) {
      summary[orderDate].sales += 1; // Increment sales count
      summary[orderDate].revenue += orderLine.totalPrice; // Add totalPrice to revenue
      summary[orderDate].income += orderLine.totalPrice - orderLine.price * orderLine.quantity; // Calculate income
    }
  }

  // Convert the summary object into an array
  return Object.entries(summary).map(([date, data]) => ({
    date,
    sales: data.sales,
    revenue: data.revenue,
    income: data.income,
  }));
}


export async function getOrderSummaryByDateRange1(from: Date, to: Date) {
  const query = {
    queryType: orderOperations.getOrderSummaryByDateRange,
    from,
    to,
  };
  const res: orderSummaryResponse[] = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    cache: "no-store",
  }).then((res) => res.json());

  const orderSummary: orderSummaryByDate[] = [];
  const currentDate = new Date(from);
  let i = 0;

  while (currentDate <= to) {
    const currentDateString = currentDate.toLocaleDateString("id");
    orderSummary.push({
      date: currentDateString,
      sales: 0,
      revenue: 0,
      income: 0,
    });

    while (i < res.length) {
      const orderDateString = new Date(
        res[i].orderedDate
      ).toLocaleDateString("id");
      if (orderDateString === currentDateString) {
        let revenue = res[i].rounding - res[i].discount;
        let income = res[i].rounding - res[i].discount;
        for (const orderLine of res[i].orderLine) {
          revenue += orderLine.sellUnitPrice * orderLine.quantity;
          income +=
            (orderLine.sellUnitPrice - orderLine.buyUnitPrice) *
            orderLine.quantity;
        }

        const lastIndex = orderSummary.length - 1;
        orderSummary[lastIndex].sales += 1;
        orderSummary[lastIndex].revenue += revenue;
        orderSummary[lastIndex].income += income;

        i += 1;
      } else {
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return orderSummary;
}

export async function getOrdersByDateRange(from: Date, to: Date) {
  const query = {
    queryType: orderOperations.getOrdersByDateRange,
    from,
    to,
  };
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    cache: "no-store",
  });
  return res.json();
}

export async function updateOrderById(order: Order) {
  const query = {
    queryType: orderOperations.updateOrderById,
    order: {
      id: order.id,
     
      requiredDate: order.requiredDate,
    },
  };
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    cache: "no-store",
  });
  return res.json();
}
