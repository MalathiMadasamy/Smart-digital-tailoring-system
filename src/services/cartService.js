import { apiFetch } from './apiClient.js';

export const cartService = {
  async getCart() {
    try {
      const saved = localStorage.getItem('digitailor_customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveCart(cartItems) {
    try {
      localStorage.setItem('digitailor_customer_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  },
};
