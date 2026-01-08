import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { doctorLoginApi, doctorGetProfile } from '../api/doctor/auth'
import type { DoctorWithProfile } from "../types"

type DoctorAuthContextType = {
    token: string | null
    doctor: DoctorWithProfile | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    refresh: () => Promise<void>
}

const DoctorAuthContext = createContext<DoctorAuthContextType | null>(null)

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
    const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null)
    const navigate = useNavigate()

    const loadProfile = async () => {
        const profile = await doctorGetProfile()
        setDoctor(profile)
    }

    const login = async (email: string, password: string) => {
        try {
            const res = await doctorLoginApi({ email, password })
            localStorage.setItem('token', res.token)
            setToken(res.token)
            await loadProfile()
            navigate('/doctor/dashboard', { replace: true })
        } catch (err: any) {
            // Extract detailed error message from axios error
            let errorMessage = 'Login failed'
            if (err?.response?.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials.'
            } else if (err?.response?.status === 400) {
                errorMessage = err?.response?.data?.message || 'Invalid input. Please check your email and password.'
            } else if (err?.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.'
            } else if (err?.message) {
                errorMessage = err.message
            }
            throw new Error(errorMessage)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setDoctor(null)
        navigate('/doctor/login', { replace: true })
    }

    const refresh = async () => loadProfile()

    useEffect(() => {
        if (!token) {
            setDoctor(null)
            return
        }

        // Only try to load doctor profile if we're in a doctor route or if we already have a doctor
        // This prevents patients from trying to access doctor-profile endpoint
        if (window.location.pathname.startsWith('/doctor')) {
            doctorGetProfile()
                .then(setDoctor)
                .catch(() => setDoctor(null))
        }
    }, [token])

    const value = useMemo(() => ({ token, doctor, login, logout, refresh }), [token, doctor])
    return <DoctorAuthContext.Provider value={value}>{children}</DoctorAuthContext.Provider>
}

export function useDoctorAuth() {
    const ctx = useContext(DoctorAuthContext)
    if (!ctx) throw new Error('useDoctorAuth must be used inside DoctorAuthProvider')
    return ctx
}
