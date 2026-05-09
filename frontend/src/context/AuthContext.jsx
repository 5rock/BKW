import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('goldmarket_token');
    const storedUser = localStorage.getItem('goldmarket_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('goldmarket_token', t);
    localStorage.setItem('goldmarket_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password, role = 'buyer') => {
    const res = await registerUser({ name, email, password, role });
    const { token: t, user: u } = res.data;
    localStorage.setItem('goldmarket_token', t);
    localStorage.setItem('goldmarket_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('goldmarket_token');
    localStorage.removeItem('goldmarket_user');
    setToken(null);
    setUser(null);
  };

  const isSeller = user?.role === 'seller';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isSeller }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
