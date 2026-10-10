import { apiFetch } from './apiClient.js';

export const measurementService = {
  async getProfiles() {
    const res = await apiFetch('/measurements');
    if (res && res.profiles) return res.profiles;

    try {
      const saved = localStorage.getItem('digitailor_measurement_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveProfile(name, values) {
    const res = await apiFetch('/measurements', {
      method: 'POST',
      body: JSON.stringify({ name, values }),
    });
    if (res) return res;

    return { success: true, profile: { id: `prof-${Date.now()}`, name, values } };
  },
};
