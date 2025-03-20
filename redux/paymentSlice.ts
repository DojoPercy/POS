import { paymentService } from "@/lib/payment";
import { CreatePaymentRequest, Payment } from "@/lib/types/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const sendPayment = createAsyncThunk(
    "payment/sendPayment",
    async (paymentData:CreatePaymentRequest) => {
        const res = await paymentService.createPayment(paymentData);
        return res;
    }

)



export const getPayments = createAsyncThunk(
    "payment/getPayments",
    async (params: { branchId?: string, companyId?: string }) => {
       if(params.branchId){
              const res = await fetch(`/api/payment?branchId=${params.branchId}`);
              return res.json();
       }else if(params.companyId){
                const res = await fetch(`/api/payment?companyId=${params.companyId}`);
                return res.json();
       }
    }
)

interface paymentState{
    payments: Payment[];
    isLoading: boolean;
    error: string | null;
}

const initialState: paymentState = {
    payments: [],
    isLoading: false,
    error: null
}
const paymentSlice = createSlice({
name: "payment",
initialState,
reducers: {
    resetPaymentState: (state) => {
        state.payments = [];
        state.isLoading = false;
        state.error = null;
    }
},
extraReducers: (builder) => {
    builder
    .addCase(getPayments.fulfilled, (state, action) => {
        state.payments = [action.payload];

    })
    .addCase(sendPayment.rejected, (state, action) => {
        state.error = action.error.message as string;
    })
    .addCase(sendPayment.pending, (state)=> {
        state.isLoading = true;
    })
}
})

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;