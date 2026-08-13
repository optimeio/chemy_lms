import { useMemo, useState } from 'react';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async ({ email, password, role = 'Student' }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Unable to sign in. Please check your email and password.');
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

