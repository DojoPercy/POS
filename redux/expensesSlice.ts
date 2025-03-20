import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getExpenseSumByDateRange,
  getTotalExpenseCount,
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getFrequentItems,
  createFrequentItem,
  deleteFrequentItem,
  updateFrequentItem,
  getCategories,
  createCategory,
} from "../lib/expense";
import { Frequent } from "@/lib/types/types";
import { Expense } from '../lib/types/types';

// Async Thunks
export const fetchExpenseSumByDateRange = createAsyncThunk(
  "expenses/fetchExpenseSumByDateRange",
  async ({ from, to }: {from:Date, to:Date}) => {
    return await getExpenseSumByDateRange(from, to);
  }
);

export const fetchTotalExpenseCount = createAsyncThunk(
  "expenses/fetchTotalExpenseCount",
  async ({ from, to }: {from:Date, to:Date}) => {
    return await getTotalExpenseCount(from, to);
  }
);

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async ({ branchId, companyId }: {branchId:string, companyId?:string}) => {
    return await getExpenses(branchId, companyId);
  }
);

export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expense: Expense) => {
    return await createExpense(expense);
  }
);

export const fetchExpenseById = createAsyncThunk(
  "expenses/fetchExpenseById",
  async (id: string) => {
    return await getExpenseById(id);
  }
);

export const editExpense = createAsyncThunk(
  "expenses/editExpense",
  async ({ id, updatedExpense }: { id: string, updatedExpense: Expense }) => {
    return await updateExpense(id, updatedExpense);
  }
);

export const removeExpense = createAsyncThunk(
  "expenses/removeExpense",
  async (id: string) => {
    return await deleteExpense(id);
  }
);

export const fetchFrequentItems = createAsyncThunk(
  "expenses/fetchFrequentItems",
  async (branchId: string) => {
    return await getFrequentItems(branchId);
  }
);

export const addFrequentItem = createAsyncThunk(
  "expenses/addFrequentItem",
  async (item: Frequent ) => {
    return await createFrequentItem(item);
  }
);

export const removeFrequentItem = createAsyncThunk(
  "expenses/removeFrequentItem",
  async (id: string) => {
    return await deleteFrequentItem(id);
  }
);

export const editFrequentItem = createAsyncThunk(
  "expenses/editFrequentItem",
  async ({ id, updatedItem }: { id: string, updatedItem: Frequent }) => {
    return await updateFrequentItem(id, updatedItem);
  }
);

export const fetchCategories = createAsyncThunk(
  "expenses/fetchCategories",
  async (branchId: string) => {
    return await getCategories(branchId);
  }
);

export const addCategory = createAsyncThunk(
  "expenses/addCategory",
  async (category: {name:string, branchId: string}) => {
    return await createCategory(category);
  }
);

export const updateExpenseDetails = createAsyncThunk(
  "expenses/updateExpense",
  async (payload: { id: string, expense: Expense }) => {
    return await updateExpense(payload.id, payload.expense);
  })
const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
    expenseSum: {totalAmount: 0},
    totalExpenseCount: {},
    frequentItems: [],
    categories: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseSumByDateRange.fulfilled, (state, action) => {
        state.expenseSum = action.payload;
      })
      .addCase(fetchTotalExpenseCount.fulfilled, (state, action) => {
        state.totalExpenseCount = action.payload;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
      })
      .addCase(fetchFrequentItems.fulfilled, (state, action) => {
        state.frequentItems = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.status = "succeeded";
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action:any) => {
          state.status = "failed";
          state.error = action.error.message;
        }
      );
  },
});

export default expensesSlice.reducer;
