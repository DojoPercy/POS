import { CreatePaymentRequest, UpdatePaymentStatusRequest } from '@/lib/types/types';
import { get } from 'http';

const API_BASE_URL = "/api/payments";

export const paymentService = {
    async getPayments(companyId?: string, branchId?: string) {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (branchId) params.append('branchId', branchId);
        console.log(`${API_BASE_URL}?${params.toString()}`);
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch payments');

        return response.json();
    },

    async getPaymentById(id: string) {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Payment not found');

        return response.json();
    },

    async createPayment(paymentData: CreatePaymentRequest) {
       try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) throw new Error('Failed to create payment');

        return response.json();
       } catch (error) {
        console.error('Failed to create payment', error);
        throw error;
       }
    },

    async updatePayment(id: string, updateData: Partial<UpdatePaymentStatusRequest>) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Failed to update payment');

        return response.json();
    },

    async deletePayment(id: string) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete payment');

        return response.json();
    },


   async  getPaymentByDateRange(from: Date, to: Date, branchId?: string, companyId?: string) {
      const queryParams = new URLSearchParams();
     
    
      if (branchId) {
        queryParams.append("branchId", branchId);
      } else if (companyId) {
        queryParams.append("companyId", companyId);
      }
    console.log(`/api/payments?${queryParams.toString()}`);
      const response = await fetch(`/api/payments?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
    
      const res = await response.json();
    
      
      if (!Array.isArray(res)) {
        console.error("Unexpected response format:", res);
        return 0;
      }
    
      const totalPayment = res.reduce((acc: number, order: any) => acc + (order.amount || 0), 0);
    
      return totalPayment.toFixed(2);
    },


     async  getPaymentSummaryByDateRangeOwner(
        from: Date,
        to: Date,
        companyId: string
      ): Promise<any[]> {
        // Fetch payments for the specified company
        const res = await fetch(`/api/payments?companyId=${companyId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const payments = (await res.json()) as any[];
      
        // Filter payments within the specified date range
        const fromTime = from.getTime();
        const toTime = to.getTime();
      
        const filteredPayments = payments.filter((payment: any) => {
          const createdTime = new Date(payment.createdAt).getTime();
          return createdTime >= fromTime && createdTime <= toTime;
        });
      
        // Group payments by date (YYYY-MM-DD)
        const summary: Record<
          string,
          { totalAmount: number; transactionCount: number }
        > = {};
      
        for (const payment of filteredPayments) {
          const paymentDate = new Date(payment.createdAt).toISOString().split("T")[0];
          if (!summary[paymentDate]) {
            summary[paymentDate] = { totalAmount: 0, transactionCount: 0 };
          }
          summary[paymentDate].totalAmount += payment.amount;
          summary[paymentDate].transactionCount += 1;
        }
      
        // Convert the summary object into an array of summary entries
        return Object.entries(summary).map(([date, data]) => ({
          date,
          payments: data.totalAmount.toFixed(2),
          transactions: data.transactionCount,
        }));
      }
      
};
