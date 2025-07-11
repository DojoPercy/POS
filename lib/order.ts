import { OrderStatus } from "@prisma/client";
import { OrderType } from "./types/types";
import { getBranchNameById } from "./branch";




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

export async function getOrders(companyId: string | undefined, branchId: string | undefined, waiterId?: string) 
{
try{
  let url: string;

  if (typeof window !== "undefined") {
   
    url = `/api/orders`;
  } else {
    
    url = new URL("/api/orders", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").toString();
  }
  
  if(branchId){
    const res = await fetch(`${url}?branchId=${branchId}`, { cache: "no-store" });
   
    return res.json();
  } else if(waiterId){
    const res = await fetch(`${url}?waiterId=${waiterId}`, { cache: "no-store" });
    return res.json();
  }
  else{
    const res = await fetch(`${url}?companyId=${companyId}`, { cache: "no-store" });
    return res.json();
  }
}catch(e){
  console.log(e);
  
}
  
}

export async function getOrderCounter( branchId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counterResponse = await fetch(`/api/ordercounter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ branchId: branchId , date: today }),
  })
  

  if (!counterResponse.ok) {
    throw new Error("Failed to fetch order counter");
  }

  const counterData = await counterResponse.json();
  const orderNumber = `ORDER-${String(counterData.lastNumber).padStart(3, "0")}`;
  return orderNumber;
}

export async function getHighestOrderInBranch(companyId: string, branchId?: string) {
  
  const orders = await getOrders(companyId, undefined);

  const branchOrderCount = orders.reduce((acc: any, order: any) => {
    if (!acc[order.branchId]) {
      acc[order.branchId] = 0;
    }
    acc[order.branchId] += 1;
    return acc;
  }, {});

  let highestBranchId = '';
  let highestOrderCount = 0;

  for (const branchId in branchOrderCount) {
    if (branchOrderCount[branchId] > highestOrderCount) {
      highestOrderCount = branchOrderCount[branchId];
      highestBranchId = branchId;
    }
  }
  const branch = await fetch(`/api/branches?id=${highestBranchId}`).then(res => res.json());

  if (!branch) {
    throw new Error('Branch not found');
  }

  return {
    branchName: branch.name,
    totalOrders: highestOrderCount,
  };
}

export async function createOrder(order: OrderType) {
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

export async function fetchIncompleteOrders(branchId: string) {
  const response = await fetch(`/api/orders?branchId=${branchId}&isCompleted=false`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  return response.json()
}
  

export async function getOrderCountByDateRange(
  from: Date,
  to: Date,
  branchId?: string,
  companyId?: string
): Promise<number> {
  try {
    // Construct query string safely
    const queryParams = new URLSearchParams();
    queryParams.append("from", from.toISOString());
    queryParams.append("to", to.toISOString());

    if (branchId) {
      queryParams.append("branchId", branchId);
    } else if (companyId) {
      queryParams.append("companyId", companyId);
    }

    const res = await fetch(`/api/orders?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.statusText}`);
    }

    const data = await res.json();

    // Ensure data is valid and an array
    if (Array.isArray(data)) {
      
      return data.length;
    } else {
      console.error("Unexpected response format:", data);
      return 0;
    }
  } catch (error) {
    console.error("Error fetching order count:", error);
    return 0;
  }
}
export async function getOrderRevenueByDateRange(from: Date, to: Date, branchId?: string, companyId?: string) {
  const queryParams = new URLSearchParams();
  queryParams.append("from", from.toISOString());
  queryParams.append("to", to.toISOString());

  if (branchId) {
    queryParams.append("branchId", branchId);
  } else if (companyId) {
    queryParams.append("companyId", companyId);
  }

  const response = await fetch(`/api/orders?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const res = await response.json();

  
  if (!Array.isArray(res)) {
    console.error("Unexpected response format:", res);
    return 0;
  }
  
  const data = res.filter((order: any) => order.orderStatus !== OrderStatus.PENDING);

  const totalRevenue = data.reduce((acc: number, order: any) => acc + (order.finalPrice || 0), 0);

  return totalRevenue.toFixed(2);
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
 
  return res;
}

export async function getOrderSummaryByDateRange(from: Date, to: Date, branchId?: string, companyId?: string): Promise<any[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("from", from.toISOString());
  queryParams.append("to", to.toISOString());

  if (branchId) {
    queryParams.append("branchId", branchId);
  } else if (companyId) {
    queryParams.append("companyId", companyId);
  }

  const res = await fetch(`/api/orders?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((response) => response.json());

  
  const summary: Record<string, { sales: number; revenue: number; income: number }> = {};
  let totalRevenue = 0;
  
  for (const order of res) {
    if (order.orderStatus === OrderStatus.PENDING) continue;
  
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
  
    if (!summary[orderDate]) {
      summary[orderDate] = {
        sales: 0,
        revenue: 0,
        income: 0,
      };
    }
  
    for (const orderLine of order.orderLines) {
      summary[orderDate].sales += 1;
      summary[orderDate].revenue += orderLine.totalPrice;
      summary[orderDate].income += orderLine.totalPrice - orderLine.price * orderLine.quantity;
    }
  
    totalRevenue += order.finalPrice || 0;
    
    summary[orderDate].revenue = totalRevenue;
  
  }
  

  // Convert the summary object into an array
  return Object.entries(summary).map(([date, data]) => ({
    date,
    sales: data.sales,
    revenue: data.revenue,
    income: data.income,
  }));
}

export async function getOrderSummaryByDateRangeOwner(from: Date, to: Date, companyId?: string): Promise<any[]> {
  const query = {
    queryType: orderOperations.getOrderSummaryByDateRange,
    from,
    to,
    companyId,
  };
  
  const queryParams = new URLSearchParams();
    queryParams.append("from", from.toISOString());
    queryParams.append("to", to.toISOString());

  if (companyId) {
      queryParams.append("companyId", companyId);
    }

  
  const res = await fetch(`/api/orders?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((response) => response.json());
  
 

  
  const summary: Record<string, { sales: number; revenue: number; income: number}> = {};

  // Iterate through the fetched data to build the summary
  for (const order of res) {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    if (order.orderStatus === OrderStatus.PENDING) continue;

    if (!summary[orderDate]) {
      summary[orderDate] = {
        sales: 0,
        revenue: 0,
        income: 0,
      };
    }

    for (const orderLine of order.orderLines) {
      summary[orderDate].sales += 1; // Increment sales count
      
      
      
    }
    summary[orderDate].revenue += order.totalPrice; 
  }

  
  return Object.entries(summary).map(([date, data]) => ({
    date,
    sales: data.sales,
    revenue: data.revenue.toFixed(2),
    
  }));
}

export async function getSalesSummaryOfBranches(from: Date, to: Date, companyId: string){
  try {
    const query = {
      queryType: orderOperations.getOrderSummaryByDateRange,
      from,
      to,
      companyId,
    };
    
    const queryParams = new URLSearchParams();
    queryParams.append("from", from.toISOString());
    queryParams.append("to", to.toISOString());

     if (companyId) {
      queryParams.append("companyId", companyId);
    }

    const res = await fetch(`/api/orders?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
.then((response) => response.json());


    const summary : Record<string, {branch: string; sales:number; revenue:number;}>={};

    for(const order of res){
      const branch = await getBranchNameById(order.branchId);
if(!branch){
  console.error("Branch not found for ID:", order.branchId);
  continue; 
}
if (order.orderStatus === OrderStatus.PENDING) continue;
      if(!summary[branch]){
        summary[branch] = {
          branch: branch,
          sales: 0,
          revenue: 0,
        };
      }

      for(const orderLine of order.orderLines){
        summary[branch].sales += 1;
       
       
      }
       summary[branch].revenue += order.totalPrice;
    }

    return Object.entries(summary).map(([branch, data]) => ({
      branch,
      sales: data.sales,
      revenue: data.revenue.toFixed(2),
    }));
    
  } catch (error) {
    console.error("Error fetching sales summary of branches:", error);
  }
}
export async function getTodaySalesSummaryOfBranches(companyId: string) {
  try {
    const now = new Date();
    const from = new Date(now.setHours(0, 0, 0, 0));
    const to = new Date(new Date().setHours(23, 59, 59, 999));

    const queryParams = new URLSearchParams();
    queryParams.append("from", from.toISOString());
    queryParams.append("to", to.toISOString());

    if (companyId) {
      queryParams.append("companyId", companyId);
    }

    const res = await fetch(`/api/orders?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).then((response) => response.json());

    console.log('today sales summary response:', res);

    const summary: Record<string, { branch: string; sales: number; revenue: number }> = {};

    for (const order of res) {
      const branch = await getBranchNameById(order.branchId);
      if (!branch) {
        console.error("Branch not found for ID:", order.branchId);
        continue;
      }

      if (order.orderStatus === OrderStatus.PENDING) continue;

      if (!summary[branch]) {
        summary[branch] = {
          branch: branch,
          sales: 0,
          revenue: 0,
        };
      }

      for (const orderLine of order.orderLines) {
        summary[branch].sales += 1;
      }

      summary[branch].revenue += order.totalPrice;
    }

    return Object.entries(summary).map(([branch, data]) => ({
      branch,
      sales: res.length,
      revenue: data.revenue.toFixed(2),
    }));
  } catch (error) {
    console.error("Error fetching today's sales summary of branches:", error);
  }
}

export async function getExpectedRevenueByDataRange(from: Date, to: Date, branchId?: string, companyId?: string){
  try{
    const queryParams = new URLSearchParams();
  queryParams.append("from", from.toISOString());
  queryParams.append("to", to.toISOString());

  if (branchId) {
    queryParams.append("branchId", branchId);
  } else if (companyId) {
    queryParams.append("companyId", companyId);
  }

  const response = await fetch(`/api/orders?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const res = await response.json();

  
  if (!Array.isArray(res)) {
    console.error("Unexpected response format:", res);
    return 0;
  }

  const data = res.filter((order: any) => order.orderStatus === OrderStatus.PENDING);

  const totalRevenue = data.reduce((acc: number, order: any) => acc + (order.totalPrice || 0), 0);

  return totalRevenue.toFixed(2);

  } catch(error){
    console.error("Error fetching expected revenue by date range:", error);
  }
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

type OrderLine = {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}



const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}`
    : `http://localhost:3000`;

export async function updateOrderById(order: OrderType): Promise<OrderType> {
  const { id, ...orderData } = order;
  
  const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Include authorization header if required
      // 'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(orderData),
  })
  


  if (!response.ok) {
    throw new Error("Failed to update order")
  }

  return response.json()
}
