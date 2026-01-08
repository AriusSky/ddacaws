import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, loginApi } from "../api/auth";
import type { Profile } from "../types";
import { toast } from "react-toastify";

type AdminAuthContextType = {
    token: string | null;
    admin: Profile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [admin, setAdmin] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAdmin = async () => {
            if (token) {
                try {
                    const profile = await getProfile();
                    if (profile.role === 'Admin') {
                        setAdmin(profile);
                    } else {
                        setAdmin(null);
                    }
                } catch (error) {
                    setAdmin(null);
                }
            }
            setIsLoading(false);
        };
        verifyAdmin();
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const res = await loginApi({ email, password });
            const profile = await getProfile(res.token);

            if (profile.role !== 'Admin') {
                toast.error("Access Denied: You are not an Admin");
                return;
            }

            localStorage.setItem("token", res.token);
            setToken(res.token);
            setAdmin(profile);
            navigate("/admin/dashboard", { replace: true });
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Login Failed");
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setAdmin(null);
        navigate("/admin/login", { replace: true });
    };

    const value = useMemo(() => ({ token, admin, isLoading, login, logout }), [token, admin, isLoading]);
    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
    return ctx;
}
