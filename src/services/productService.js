import { apiFetch } from './apiClient.js';
import dresses, { ALL_PRODUCTS } from '../data/dresses.js';

export const productService = {
  async getAllProducts() {
    const res = await apiFetch('/products');
    if (res && res.products && res.products.length > 0) {
      return res.products;
    }
    return ALL_PRODUCTS;
  },

  async getProductsByDepartment(department) {
    const all = await this.getAllProducts();
    if (department === 'All' || !department) return all;
    return all.filter((p) => p.department.toLowerCase() === department.toLowerCase());
  },

  async searchPexelsImages(query = 'blouse', page = 1, perPage = 20) {
    try {
      const res = await apiFetch(`/image-search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
      if (res && res.products) {
        return res.products;
      }
      return [];
    } catch (err) {
      console.error('[productService searchPexelsImages error]', err);
      return [];
    }
  },
};
