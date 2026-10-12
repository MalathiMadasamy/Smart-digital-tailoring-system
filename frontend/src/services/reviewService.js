import { apiFetch } from './apiClient.js';

export const reviewService = {
  async getReviews() {
    try {
      const saved = localStorage.getItem('digitailor_customer_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async addReview(reviewData) {
    try {
      const existing = await this.getReviews();
      const newReview = { id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...reviewData };
      const updated = [newReview, ...existing];
      localStorage.setItem('digitailor_customer_reviews', JSON.stringify(updated));
      return { success: true, review: newReview };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },
};
