import { Expense } from "./types/types";

const API_URL = "/api/expenses";
type ExpenseSummaryResponse = {
    date: string;
    amount: number;
  };
  
  export type ExpenseSummaryByDate = {
    date: string;
    expenses: number;
  };
  export enum expenseOperations {
    getExpenseSumByDateRange,
    getExpenseSummaryByDateRange,
    getExpensesPerBranch,
    createExpensesPerBranch,
    getExpensesPerCategory,
    getExpensesAmountByDateRange,
    getTotalExpenseCount,
  }
  
  // 🔹 Get total amount of expenses within a date range
  export async function getExpenseSumByDateRange(from: Date, to: Date): Promise<{ totalAmount: number }> {
    const query = {
      queryType: expenseOperations.getExpenseSumByDateRange,
      from: from,
      to: to,
    };
    const res = await fetch("/api/expenses/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
      cache: "no-store",
    }).then((res) => res.json());
    return res;
  }
  
  // 🔹 Get total count of expenses within a date range
  export async function getTotalExpenseCount(from: Date, to: Date): Promise<{ totalCount: number }> {
    const query = {
      queryType: expenseOperations.getTotalExpenseCount,
      from,
      to,
    };
    const res = await fetch("/api/expenses/count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
      cache: "no-store",
    }).then((res) => res.json());
    return res.totalCount;
  }
export async function getExpenses(branchId?: string, companyId?: string) {
    const queryParams = new URLSearchParams();
    if (branchId) queryParams.append("branchId", branchId);
    if (companyId) queryParams.append("companyId", companyId);

    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
        method: "GET",
        credentials: "include",
    });
    return response.json();
}

export async function createExpense(expense: Expense) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(expense),
    });
    return response.json();
}

export async function getExpenseById(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        credentials: "include",
    });
    return response.json();
}

export async function updateExpense(id: string, updatedExpense: Partial<Expense>) {
    console.log("Updating expense with ID:", updatedExpense);
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedExpense),
    });
    return response.json();
}

export async function deleteExpense(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return response.json();
}


export async function getFrequentItems(branchId: string) {
    const response = await fetch(`/api/expenses/frequent-items?branchId=${branchId}`, {
        method: "GET",
        credentials: "include",
    });
    return response.json();
}

export async function createFrequentItem(item: { itemName: string; branchId: string , categoryId: string; quantity: number , isFrequent: boolean }) {
    const response = await fetch(`/api/expenses/frequent-items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(item),
    });
    return response.json();
}  

export async function deleteFrequentItem(id: string) {
    const response = await fetch(`/api/expenses/frequent-items/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return response.json();
}

export async function updateFrequentItem(id: string, updatedItem: { itemName: string; branchId: string; categoryId: string; quantity: number }) {
    const response = await fetch(`/api/expenses/frequent-items/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedItem),
    });
    return response.json();
}

export async function getCategories(branchId: string) {
    
    const response = await fetch(`/api/expenses/category?branchId=${branchId}`, {
        method: "GET",
        credentials: "include",
    });
    return response.json();
}

export async function createCategory(category: { name: string; branchId: string }) {
    const response = await fetch(`/api/expenses/category`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(category),
    });
    return response.json();
}