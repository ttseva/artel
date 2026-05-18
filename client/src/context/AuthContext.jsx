import { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user: registeredUser } = response.data;
    localStorage.setItem("token", token);
    setUser(registeredUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isMaster: user?.role === "master",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
