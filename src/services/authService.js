import { apiFetch } from './apiClient.js';

export const authService = {
  async login(emailOrPhone, password, role) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password, role }),
    });

    if (res && res.token) {
      localStorage.setItem('digitailor_token', res.token);
      localStorage.setItem('digitailor_current_user', JSON.stringify(res.user));
      return res;
    }

    // Demo localStorage fallback
    const user = { id: `usr-${Date.now()}`, name: emailOrPhone.split('@')[0] || 'Malathi', email: emailOrPhone, role };
    localStorage.setItem('digitailor_current_user', JSON.stringify(user));
    return { success: true, user };
  },

  async register(name, email, phone, role) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, role }),
    });
    if (res) return res;

    return { success: true, message: 'User registered in demo storage' };
  },

  logout() {
    localStorage.removeItem('digitailor_token');
    localStorage.removeItem('digitailor_current_user');
  },
};
