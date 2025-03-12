import { CreatePaymentRequest, UpdatePaymentStatusRequest } from '@/lib/types/types';

const API_BASE_URL = '/api/payments';

export const paymentService = {
    async getPayments(companyId?: string, branchId?: string) {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (branchId) params.append('branchId', branchId);

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
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) throw new Error('Failed to create payment');

        return response.json();
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
};
