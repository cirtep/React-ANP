import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);
const baseUrl = import.meta.env.VITE_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Create more specific error messages based on status codes
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        } else if (response.status === 403) {
          throw new Error(
            "Your account has been locked. Please contact support."
          );
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      // Store token and user in state
      setToken(data.data.access_token);
      setCurrentUser(data.data.user);
      localStorage.setItem("token", data.data.access_token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message || "An error occurred during login",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const isExpired = () => {
    if (!token) return true;

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (!decodedToken.exp || typeof decodedToken.exp !== "number") {
        console.error("Token tidak memiliki properti 'exp' yang valid.");
        return true;
      }

      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error("Terjadi kesalahan saat mendekode token:", error);
      return true;
    }
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated,
    isExpired,
    loading,
    setLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
