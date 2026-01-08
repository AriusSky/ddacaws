import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDoctorAuth } from '../context/DoctorAuthContext'

export default function DoctorProtectedRoute() {
    const { token } = useDoctorAuth()
    const location = useLocation()
    if (!token) return <Navigate to="/doctor/login" replace state={{ from: location }} />
    return <Outlet />
}