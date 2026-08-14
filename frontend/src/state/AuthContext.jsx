import { useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { getApiBaseUrl } from '../services/apiConfig';

const API_BASE_URL = getApiBaseUrl();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async ({ email, password, role = 'Student' }) => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
    } catch (networkErr) {
      throw new Error('Unable to connect to server. If using Render free tier, the server may take 30-50s to wake up, or please ensure your backend is running.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Backend server returned an invalid response. If using Render free tier, the backend may take 30-50s to wake up.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data?.message || 'Unable to sign in. Please check your email and password.');
    }

    const returnedRole = data.user.role || 'Student';
    if (returnedRole.toLowerCase() !== role.toLowerCase() && returnedRole.toLowerCase() !== 'super admin') {
      throw new Error(`Please login as ${returnedRole}.`);
    }

    const safeUser = {
      email: data.user.email,
      fullName: data.user.fullName,
      role: returnedRole,
      dashboard: data.user.dashboard || 'a',
      college: data.user.college,
      department: data.user.department,
      phone: data.user.phone || '',
      year: data.user.year || '',
      gender: data.user.gender || '',
      profileImage: data.user.profileImage || '',
    };

    localStorage.setItem('user', JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

