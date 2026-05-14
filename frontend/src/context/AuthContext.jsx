import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const getUserIdFromToken = (authToken) => {
    try {
      const payloadPart = authToken.split('.')[1];
      if (!payloadPart) return null;

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));
      return payload.id || payload.userId || payload.sub || null;
    } catch (error) {
      return null;
    }
  };

  const fetchUserProfile = async (authToken, userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/auth/profile/${userId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    setUser(response.data.user);
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setLoading(true);
      const userId = getUserIdFromToken(storedToken);
      if (userId) {
        fetchUserProfile(storedToken, userId)
          .then(() => setLoading(false))
          .catch(() => fetchUser(storedToken));
      } else {
        fetchUser(storedToken);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken, options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await axios.get(
        `http://localhost:5000/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        await fetchUserProfile(authToken, response.data.userId);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (!silent) {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    await fetchUser(token, { silent: true });
  };

  const signup = async (name, email, password, confirmPassword) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        { name, email, password, confirmPassword }
      );

      if (response.data.success) {
        const authToken = response.data.token;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Signup failed';
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }
      );

      if (response.data.success) {
        const authToken = response.data.token;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google', { idToken });

      if (response.data.success) {
        const authToken = response.data.token;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Google sign-in failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
