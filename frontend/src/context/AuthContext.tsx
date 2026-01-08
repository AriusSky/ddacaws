import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// We'll use the well-structured API calls from the 'main' branch
import { getProfile, loginApi, registerApi } from "../api/auth";
import type { Profile } from "../types"; // Use the detailed Profile type

// The context type remains similar to 'main'
type AuthContextType = {
  token: string | null;
  user: Profile | null;
  isLoading: boolean; // Add a loading state for initial auth check
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>; // Use 'any' for simplicity or a detailed RegisterPayload type
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const navigate = useNavigate();

  // On initial app load, verify the token and fetch the user profile.
  // This is the robust pattern from 'main'.
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Token verification failed, logging out.", error);
          // If the token is invalid or expired, clear it.
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const { token } = await loginApi({ email, password });

      localStorage.setItem("token", token);
      setToken(token);
      // We can use the user object from the login response for immediate role check
      // and then fetch the full profile for consistency.
      const profile = await getProfile(token);
      setUser(profile);

      // --- CRITICAL MERGE: Role-based navigation from the 'admin' branch ---
      const userRole = profile.role; // Use the role from the full profile
      if (userRole === 'Admin') {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === 'Doctor') {
        navigate("/doctor/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true }); // Default to patient dashboard
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (data: any) => {
    // Register the user
    await registerApi(data);
    // If registration succeeds, auto-login to get token and redirect
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // Navigate to a neutral, public page.
    navigate("/login", { replace: true });
  };

  const refreshProfile = async () => {
    if (token) {
      const p = await getProfile();
      setUser(p);
    }
  };

  const value = useMemo(
    () => ({ token, user, isLoading, login, register, logout, refreshProfile }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook to use the context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
