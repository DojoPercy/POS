// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./orderSlice";
import expensesReducer from "./expensesSlice";
import companyCategoryMenuReducer from "./CompanyCategoryMenuSlice";
import authReducer from "./authSlice";
import companyMenuReducer from "./companyMenuSlice";


export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    expenses: expensesReducer,
    menuCategories: companyCategoryMenuReducer,
    auth: authReducer,
    menu: companyMenuReducer,
  },

});

// Infer types for useSelector & useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
