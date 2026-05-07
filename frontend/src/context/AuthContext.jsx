import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
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
        // Fetch full user profile
        const userResponse = await axios.get(
          `http://localhost:5000/api/auth/profile/${response.data.userId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setUser(userResponse.data.user);
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
