export type Summary = {
    totalRevenue: number;
    totalExpense: number;
    profit: number;
}
// lib/api/getSalesSummaryOfBranches.ts

export interface BranchSalesSummary {
    branch: string;
    sales: number;
    revenue: string; // returned as string due to `.toFixed(2)`
  }
  
  export async function getSalesSummaryOfBranches(
    from: Date,
    to: Date,
    companyId: string
  ): Promise<BranchSalesSummary[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("fromDate", from.toISOString());
      queryParams.append("toDate", to.toISOString());
      queryParams.append("companyId", companyId);
  
      const res = await fetch(`/api/summary/branches?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
  
      const data = await res.json();
      return data as BranchSalesSummary[];
    } catch (error) {
      console.error("Error fetching branch sales summary:", error);
      return [];
    }
  }
  
export async function  getProfitSummaryByDateRange(from: Date, to:Date , branchId: string | undefined, companyId: string | undefined){

    try {
        const queryParams = new URLSearchParams();
        if (branchId) queryParams.append("branchId", branchId);
        if (companyId) queryParams.append("companyId", companyId);
        if (from && to) {
            queryParams.append("from", from.toISOString());
            queryParams.append("to", to.toISOString());
        }
        const summary : Summary = await  fetch("/api/summary/expense_revenue?" + queryParams.toString()) 
        .then((res) => res.json())
        console.log("Profit Summary:", summary);
        return summary;
        
    } catch (error) {
        console.error("Error fetching profit summary:", error);
        throw error;
        
    }
} 

export async function getTopMenusByDateRange(from: Date, to: Date, branchId : string | undefined ,  companyId: string | undefined) {
    try {
        const queryParams = new URLSearchParams();
        if (companyId) queryParams.append("companyId", companyId);
        if (branchId) queryParams.append("branchId", branchId);
        if (from && to) {
            queryParams.append("fromDate", from.toISOString());
            queryParams.append("toDate", to.toISOString());
        }
        const topMenus = await fetch("/api/summary/menuitems?" + queryParams.toString())
            .then((res) => res.json())
        console.log("Top Menus:", topMenus);
        return topMenus;
    } catch (error) {
        console.error("Error fetching top menus:", error);
        throw error;
    }
}