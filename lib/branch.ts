import { get } from "http";
import type { DateRange } from "react-day-picker"

export interface BranchSummary {
  branchId: string
  totalOrders: number
  totalItems: number
  totalAmount: number
  averageOrderValue: number
  averageItemsPerOrder: number
  dateRange: {
    from: string
    to: string
  }
  byWaiter: Record<
    string,
    {
      waiterId: string
      waiterName?: string
      orders: number
      items: number
      amount: number
      averageOrderValue: number
    }
  >
  dailyBreakdown: Array<{
    date: string
    orders: number
    items: number
    amount: number
  }>
  topPerformers: {
    topWaiter: { waiterId: string; waiterName?: string; amount: number } | null
    busiestDay: { date: string; orders: number } | null
    highestSalesDay: { date: string; amount: number } | null
  }
  lastUpdated: string
}

export interface BranchPerformance {
  branchId: string
  period: number
  metric: string
  data: Array<{
    date: string
    orders: number
    items: number
    sales: number
    [key: string]: string | number
  }>
  summary: {
    totalOrders: number
    totalItems: number
    totalSales: number
    averageDaily: {
      orders: number
      items: number
      sales: number
    }
  }
  lastUpdated: string
}

export async function fetchBranchSummary(branchId: string, dateRange?: DateRange): Promise<BranchSummary> {
  const params = new URLSearchParams({ branchId })

  if (dateRange?.from) {
    params.append("from", dateRange.from.toISOString().split("T")[0])
  }
  if (dateRange?.to) {
    params.append("to", dateRange.to.toISOString().split("T")[0])
  }

  const response = await fetch(`/api/orders/branch?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch branch summary")
  }

  return response.json()
}

export async function fetchBranchPerformance(
  branchId: string,
  period = 7,
  metric = "sales",
): Promise<BranchPerformance> {
  const params = new URLSearchParams({
    branchId,
    period: period.toString(),
    metric,
  })

  const response = await fetch(`/api/orders/branch/performance?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch branch performance")
  }

  return response.json()
}


export async function getBranchById(id: string) {
    try {
      const response = await fetch(`/api/branches?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch branch with id ${id}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("getBranchById error:", error);
      return null;
    }
  }
  
  export async function getBranchNameById(id: string): Promise<string | null> {
    try {
      const res = await getBranchById(id);
      if (res && Array.isArray(res) && res.length > 0) {
        return res[0].name;
      } else if (res && res.name) {
        return res.name; // in case your API returns a single object instead of an array
      }
      return null;
    } catch (error) {
      console.error("getBranchNameById error:", error);
      return null;
    }
  }
  

export async function getBranches(companyId: String){
    try{
        const response = await fetch(`/api/branches?companyId=${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        }).then((res) => res.json());
    
        return response;
    }catch{
        

    }
}

