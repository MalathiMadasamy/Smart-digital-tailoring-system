import { apiFetch } from './apiClient.js';

export const orderService = {
  async getOrders() {
    const res = await apiFetch('/orders');
    if (res && res.orders) return res.orders;

    try {
      const saved = localStorage.getItem('digitailor_customer_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async createOrder(orderData) {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    if (res) return res;

    return { success: true, orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}` };
  },

  async updateOrderStatus(orderId, status) {
    const res = await apiFetch(`/tailors/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res) return res;

    return { success: true, message: `Status updated to ${status}` };
  },
};
