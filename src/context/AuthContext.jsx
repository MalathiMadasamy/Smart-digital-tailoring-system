import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const SEED_USERS = [
  {
    id: 'USR-MALATHI-01',
    username: 'malathi',
    name: 'Malathi Lakshmi',
    role: 'CUSTOMER',
    defaultRole: 'customer',
    email: 'malathi@digitailor.com',
    phone: '9876543210',
    password: 'malathi123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-24104102',
    username: '24104102',
    name: 'Malathi Lakshmi',
    role: 'CUSTOMER',
    defaultRole: 'customer',
    email: 'malathi@digitailor.com',
    phone: '9876543210',
    password: 'cus123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-ADM-01',
    username: 'admin01',
    name: 'Atelier Admin',
    storeName: 'Smart Digital Tailoring System',
    role: 'ADMIN',
    defaultRole: 'admin',
    email: 'admin@digitailor.com',
    phone: '9988776655',
    password: 'admin123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-TLR-01',
    username: 'tailor01',
    name: 'Priya',
    roleTitle: 'Master Tailor',
    specialization: 'Designer Blouse • Aari Work • Bridal Blouse',
    experience: '5 years',
    role: 'TAILOR',
    defaultRole: 'tailor',
    email: 'tailor@digitailor.com',
    phone: '9876501234',
    password: 'tailor123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-CUS-001',
    username: 'customer',
    name: 'Malathi Lakshmi',
    role: 'CUSTOMER',
    defaultRole: 'customer',
    email: 'malathi@digitailor.com',
    phone: '9876543210',
    password: 'cus123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-TLR-002',
    username: 'tailor',
    name: 'Priya',
    roleTitle: 'Master Tailor',
    specialization: 'Designer Blouse • Aari Work • Bridal Blouse',
    experience: '5 years',
    role: 'TAILOR',
    defaultRole: 'tailor',
    email: 'tailor@digitailor.com',
    phone: '9876501234',
    password: 'tailor123',
    altPassword: '123',
    created: '2026-09-01',
  },
  {
    id: 'USR-ADM-002',
    username: 'admin',
    name: 'Atelier Admin',
    storeName: 'Smart Digital Tailoring System',
    role: 'ADMIN',
    defaultRole: 'admin',
    email: 'admin@digitailor.com',
    phone: '9988776655',
    password: 'admin123',
    altPassword: '123',
    created: '2026-09-01',
  },
];

export function AuthProvider({ children }) {
  // useState: Active user session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem('digitailor_auth_role');
      if (savedRole) return savedRole;
      const savedUser = localStorage.getItem('digitailor_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return (parsed.role || parsed.defaultRole || 'customer').toLowerCase();
      }
      return null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure SEED_USERS demo accounts exist in usersList
        const merged = [...parsed];
        SEED_USERS.forEach((seed) => {
          if (!merged.some((u) => u.username && u.username.toLowerCase() === seed.username.toLowerCase())) {
            merged.push(seed);
          }
        });
        return merged;
      }
      return SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [rememberedIdentifier, setRememberedIdentifier] = useState(() => {
    try {
      return localStorage.getItem('digitailor_remember_identifier') || '';
    } catch {
      return '';
    }
  });

  // useEffect: Persist registered users database
  useEffect(() => {
    try {
      localStorage.setItem('digitailor_registered_users', JSON.stringify(usersList));
    } catch (e) {
      console.error('Failed to save users database', e);
    }
  }, [usersList]);

  // useEffect: Persist active session user
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('digitailor_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('digitailor_auth_user');
      }
    } catch (e) {
      console.error('Failed to update auth storage', e);
    }
  }, [user]);

  // useEffect: Check for OAuth JWT token in URL query parameters on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const googleAuth = urlParams.get('googleAuth');

      if (urlToken && (googleAuth === 'success' || urlToken.length > 20)) {
        const base64Url = urlToken.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);

          const authUser = {
            id: decoded.id || `google-usr-${Date.now()}`,
            name: decoded.name || decoded.username || 'Google User',
            username: decoded.username || decoded.email?.split('@')[0] || 'googleuser',
            email: decoded.email || '',
            role: (decoded.role || 'customer').toLowerCase(),
            defaultRole: (decoded.role || 'customer').toLowerCase(),
            provider: 'google',
            authProvider: 'google',
          };

          setUser(authUser);
          setActiveRole(authUser.role);
          localStorage.setItem('digitailor_auth_user', JSON.stringify(authUser));
          localStorage.setItem('digitailor_auth_role', authUser.role);
          localStorage.setItem('digitailor_jwt_token', urlToken);

          // Clean URL params without page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (e) {
      console.warn('[OAuth URL Token Check Note]', e);
    }
  }, []);

  // useEffect: Persist active workspace role
  useEffect(() => {
    try {
      if (activeRole) {
        localStorage.setItem('digitailor_auth_role', activeRole);
      } else {
        localStorage.removeItem('digitailor_auth_role');
      }
    } catch (e) {
      console.error('Failed to update role storage', e);
    }
  }, [activeRole]);

  // Login handler — Reads NAME, USERNAME, EMAIL, PHONE, and ROLE from matching user account record
  const login = useCallback(
    ({ identifier, password, rememberMe }) => {
      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanId || !cleanPass) {
        return { success: false, message: 'Invalid username or password.' };
      }

      // Find user account in usersList or SEED_USERS
      const foundUser =
        usersList.find(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanId) ||
            (u.name && u.name.toLowerCase() === cleanId) ||
            (u.name && u.name.toLowerCase().replace(/\s+/g, '') === cleanId) ||
            (u.email && u.email.toLowerCase() === cleanId) ||
            (u.phone && u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
            (u.id && u.id.toLowerCase() === cleanId)
        ) ||
        SEED_USERS.find(
          (u) =>
            u.username.toLowerCase() === cleanId ||
            u.name.toLowerCase() === cleanId ||
            u.email.toLowerCase() === cleanId
        );

      if (!foundUser) {
        return {
          success: false,
          message: 'Invalid username or password.',
        };
      }

      // Verify password
      if (foundUser.password !== cleanPass && foundUser.altPassword !== cleanPass) {
        return { success: false, message: 'Invalid username or password.' };
      }

      // Read user's NAME and ROLE from account record
      const roleStr = (foundUser.role || foundUser.defaultRole || 'customer').toLowerCase();

      // Update session state
      setUser(foundUser);
      setActiveRole(roleStr);

      if (rememberMe) {
        localStorage.setItem('digitailor_remember_identifier', cleanId);
        setRememberedIdentifier(cleanId);
      } else {
        localStorage.removeItem('digitailor_remember_identifier');
        setRememberedIdentifier('');
      }

      return { success: true, user: foundUser, role: roleStr };
    },
    [usersList]
  );

  // Signup handler (Does NOT auto-login; user MUST log in on /login page)
  const signup = useCallback(
    ({ name, email, phone, password, role = 'customer' }) => {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').trim();
      const cleanPass = (password || '').trim();

      if (!cleanName) return { success: false, message: 'Full Name is required.' };
      if (!cleanEmail) return { success: false, message: 'Email address is required.' };
      if (!cleanPhone) return { success: false, message: 'Phone number is required.' };
      if (!cleanPass || cleanPass.length < 3)
        return { success: false, message: 'Password must be at least 3 characters long.' };

      // Check existing email
      const existing = usersList.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, message: 'An account with this email already exists. Please log in.' };
      }

      const generatedUsername = cleanName.toLowerCase().replace(/\s+/g, '');

      const newUser = {
        id: `USR-${Date.now()}`,
        username: generatedUsername,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPass,
        role: 'customer',
        defaultRole: 'customer',
        created: new Date().toISOString().split('T')[0],
      };

      setUsersList((prev) => [...prev, newUser]);
      return { success: true, message: `Account created successfully! You can log in using username "${generatedUsername}" or your email.` };
    },
    [usersList]
  );

  const selectRole = useCallback((role) => {
    if (['customer', 'tailor', 'admin'].includes(role)) {
      setActiveRole(role);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('digitailor_auth_user');
    localStorage.removeItem('digitailor_auth_role');
  }, []);

  const forgotPassword = useCallback(
    (email) => {
      const cleanEmail = (email || '').trim().toLowerCase();
      const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return { success: false, message: 'No registered account found with that email address.' };
      }
      return {
        success: true,
        message: `Password reset link sent to ${cleanEmail}. (Demo password is: ${found.password})`,
      };
    },
    [usersList]
  );

  const demoLogin = useCallback(
    (role) => {
      const target = usersList.find((u) => u.defaultRole === role) || SEED_USERS.find((u) => u.defaultRole === role);
      if (target) {
        setUser(target);
        setActiveRole(role);
        return target;
      }
      return null;
    },
    [usersList]
  );

  const loginWithUserObj = useCallback((userData, tokenStr) => {
    const userRole = (userData.role || userData.defaultRole || 'customer').toLowerCase();
    setUser(userData);
    setActiveRole(userRole);
    if (tokenStr) {
      try {
        localStorage.setItem('digitailor_jwt_token', tokenStr);
      } catch (e) {}
    }
    return { success: true, user: userData, role: userRole };
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      activeRole,
      rememberedIdentifier,
      login,
      loginWithUserObj,
      signup,
      selectRole,
      logout,
      forgotPassword,
      demoLogin,
      isAuthenticated: !!user,
    }),
    [user, activeRole, rememberedIdentifier, login, loginWithUserObj, signup, selectRole, logout, forgotPassword, demoLogin]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
