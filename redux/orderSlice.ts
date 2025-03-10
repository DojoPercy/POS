// store/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, RootState } from "@reduxjs/toolkit";
import { createOrder, getOrders, updateOrderById } from "@/lib/order";
import { OrderType } from "@/lib/types/types";

// 🏷️ Define the state type
interface OrderState {
  orders: OrderType[];
  loading: boolean;
  error?: string | null;
}


const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};


export const fetchOrders = createAsyncThunk<OrderType[], string>(
  "orders/fetch",
  async (waiterId) => {
    const data = await getOrders(undefined, undefined, waiterId);
    console.log("Fetched orders:", data);
    return Array.isArray(data) ? data : [];
  }
);

export const placeOrder = createAsyncThunk<OrderType, OrderType>(
  "orders/place",
  async (order) => {
    
    const newOrder = await createOrder(order);
    return newOrder;
  });




export const updateOrder = createAsyncThunk<OrderType, OrderType>(
  "orders/update",
  async (order) => {
    await updateOrderById(order);
    return order;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrderLocally: (state, action: PayloadAction<OrderType>) => {
      if (!Array.isArray(state.orders)) state.orders = [];
      state.orders.push(action.payload);
    },
    updateOrderLocally: (state, action: PayloadAction<OrderType>) => {
      if (Array.isArray(state.orders)) {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      if (Array.isArray(state.orders)) {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch orders.";
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        if (Array.isArray(state.orders)) {
          const index = state.orders.findIndex((o) => o.id === action.payload.id);
          if (index !== -1) state.orders[index] = action.payload;
        }
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        if (!Array.isArray(state.orders)) state.orders = [];
        state.orders.push(action.payload);
      });
  },
});

export const selectOrderById = (state: RootState, orderId: string) =>
    state.orders.orders.find((order: OrderType) => order.id === orderId);
export const { addOrderLocally, updateOrderLocally, removeOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
