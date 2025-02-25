// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./orderSlice";


export const store = configureStore({
  reducer: {
    orders: ordersReducer,
   
  },

});

// Infer types for useSelector & useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
