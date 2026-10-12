import { apiFetch } from './apiClient.js';

export const userService = {
  async getProfile() {
    const res = await apiFetch('/users/profile');
    if (res) return res.profile;

    try {
      const saved = localStorage.getItem('digitailor_customer_profile');
      return saved ? JSON.parse(saved) : { name: 'Malathi', phone: '9876543210' };
    } catch {
      return { name: 'Malathi', phone: '9876543210' };
    }
  },

  async getCustomers() {
    const res = await apiFetch('/customers');
    if (res) return res;

    return { count: 128 };
  },
};
