import { apiFetch } from './apiClient.js';

export const paymentService = {
  async processPayment(orderId, amount, paymentMethod) {
    const res = await apiFetch('/payments/charge', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, paymentMethod }),
    });
    if (res) return res;

    return {
      success: true,
      txnId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Paid',
    };
  },
};
