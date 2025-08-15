import { Expense } from './types/types';

const API_URL = '/api/expenses';

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

export async function getExpenseSumByDateRange(
  from: Date,
  to: Date,
  branchId?: string,
  companyId?: string
): Promise<number> {
  if (companyId) {
    const res = await fetch(`/api/expenses?companyId=${companyId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const resData = await res.json();
    let totalAmount = 0;
    for (const payment of resData) {
      totalAmount += payment.amount;
    }
    return totalAmount;
  }
  if (branchId) {
    const res = await fetch(`/api/expenses?branchId=${branchId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const resData = await res.json();
    let totalAmount = 0;
    for (const payment of resData) {
      totalAmount += payment.amount;
    }
    return totalAmount;
  }
  return 0;
}

export async function getExpensesSummaryByDateRangeOwner(
  from: Date,
  to: Date,
  companyId: string
): Promise<any[]> {
  const res = await fetch(`/api/expenses?companyId=${companyId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch expenses: ${res.statusText}`);
  }

  const expenses = (await res.json()) as any[];
  console.log(expenses);

  // Convert from and to dates to UTC time (start and end of the day)
  const fromTime = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
    0,
    0,
    0,
    0
  );
  const toTime = Date.UTC(
    to.getFullYear(),
    to.getMonth(),
    to.getDate(),
    23,
    59,
    59,
    999
  );

  const filteredExpenses = expenses.filter((expense: any) => {
    const createdTime = new Date(expense.dateAdded).getTime();
    return createdTime >= fromTime && createdTime <= toTime;
  });

  // Group payments by date (YYYY-MM-DD)
  const summary: Record<
    string,
    { totalExpenses: number; totalExpensesCount: number }
  > = {};

  for (const payment of filteredExpenses) {
    const paymentDate = new Date(payment.dateAdded).toISOString().split('T')[0];
    if (!summary[paymentDate]) {
      summary[paymentDate] = { totalExpenses: 0, totalExpensesCount: 0 };
    }
    summary[paymentDate].totalExpenses += Number(payment.amount);
    summary[paymentDate].totalExpensesCount += 1;
    console.log(summary[paymentDate].totalExpenses);
  }

  return Object.entries(summary).map(([date, data]) => ({
    date,
    totalExpenses: data.totalExpenses,
    totalExpensesCount: data.totalExpensesCount,
  }));
}

// 🔹 Get total count of expenses within a date range
export async function getTotalExpenseCount(
  from: Date,
  to: Date,
  branchId?: string,
  companyId?: string
): Promise<number> {
  const query = {
    queryType: expenseOperations.getTotalExpenseCount,
    from,
    to,
  };
  if (companyId) {
    const res = await fetch('/api/expenses/count?companyId=' + companyId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
      cache: 'no-store',
    }).then(res => res.json());
    return res.totalCount;
  }
  if (branchId) {
    const res = await fetch('/api/expenses/count?branchId=' + branchId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
      cache: 'no-store',
    }).then(res => res.json());
    return res.totalCount;
  }
  return 0;
}
export async function getExpenses(branchId?: string, companyId?: string) {
  const queryParams = new URLSearchParams();
  if (branchId) queryParams.append('branchId', branchId);
  if (companyId) queryParams.append('companyId', companyId);

  const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response.json();
}

export async function createExpense(expense: Expense) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(expense),
  });
  return response.json();
}

export async function getExpenseById(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response.json();
}

export async function updateExpense(
  id: string,
  updatedExpense: Partial<Expense>
) {
  console.log('Updating expense with ID:', updatedExpense);
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updatedExpense),
  });
  return response.json();
}

export async function deleteExpense(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
}

export async function getFrequentItems(branchId: string) {
  const response = await fetch(
    `/api/expenses/frequent-items?branchId=${branchId}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  return response.json();
}

export async function createFrequentItem(item: {
  itemName: string;
  branchId: string;
  categoryId: string;
  quantity: number;
  isFrequent: boolean;
}) {
  const response = await fetch('/api/expenses/frequent-items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(item),
  });
  return response.json();
}

export async function deleteFrequentItem(id: string) {
  const response = await fetch(`/api/expenses/frequent-items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
}

export async function updateFrequentItem(
  id: string,
  updatedItem: {
    itemName: string;
    branchId: string;
    categoryId: string;
    quantity: number;
  }
) {
  const response = await fetch(`/api/expenses/frequent-items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updatedItem),
  });
  return response.json();
}

export async function getCategories(branchId: string) {
  const response = await fetch(`/api/expenses/category?branchId=${branchId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response.json();
}

export async function createCategory(category: {
  name: string;
  branchId: string;
}) {
  const response = await fetch('/api/expenses/category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(category),
  });
  return response.json();
}
