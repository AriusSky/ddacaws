import {Routes, Route, Navigate} from 'react-router-dom'

import {AuthProvider} from './context/AuthContext'
import {DoctorAuthProvider} from './context/DoctorAuthContext'
import {AdminAuthProvider} from './context/AdminAuthContext'

import PatientLayout from './layout/PatientLayout'
import AdminLayout from './layout/AdminLayout'
import DoctorLayout from './layout/DoctorLayout'

import ProtectedRoute from './routes/ProtectedRoute'
import DoctorProtectedRoute from './routes/DoctorProtectedRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'

// Public pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import DoctorLogin from './pages/doctor/auth/Login'
import AdminLogin from './pages/admin/auth/Login'

// Patient pages
import Dashboard from './pages/patient/Dashboard'
import Profile from './pages/patient/Profile'
import Doctors from './pages/patient/Doctors'
import DoctorDetail from './pages/patient/DoctorDetail'
import Appointments from './pages/patient/Appointments'
import BookAppointment from './pages/patient/BookAppointment'
import MedicalRecords from './pages/patient/MedicalRecords'
import MedicalRecordDetail from './pages/patient/MedicalRecordDetail'
import Prescriptions from './pages/patient/Prescriptions'
import HealthData from './pages/patient/HealthData'
import AiConsultation from './pages/patient/AiConsultation'
import MedicationIdentifier from './pages/patient/MedicationIdentifier'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard.tsx'
import DoctorAppointments from './pages/doctor/Appointments.tsx'
import DoctorClinical from './pages/doctor/Clinical.tsx'
import DoctorPatients from './pages/doctor/Patients.tsx'
import DoctorPatientDetail from './pages/doctor/PatientDetail.tsx'
import DoctorAiTools from './pages/doctor/AiTools.tsx'
import DoctorProfile from './pages/doctor/Profile.tsx'
import DoctorIncome from './pages/doctor/Income.tsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import DoctorManagement from './pages/admin/DoctorManagement'
import BlockchainVerify from './pages/admin/BlockchainVerify'
import AdminRegister from './pages/admin/AdminRegister';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import PrescriptionDetail from './pages/patient/PrescriptionDetail.tsx'


export default function App() {
    return (
        // Wrap the entire app in all three auth providers
        <AuthProvider>
            <DoctorAuthProvider>
                <AdminAuthProvider>
                    <Routes>
                        {/* === PUBLIC ROUTES === */}
                        <Route path="/" element={<Navigate to="/login" replace/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/doctor/login" element={<DoctorLogin/>}/>
                        <Route path="/admin/login" element={<AdminLogin/>}/>
                        <Route element={<ProtectedRoute/>}>
                            <Route element={<PatientLayout/>}>
                                <Route index element={<Navigate to="/dashboard" replace/>}/>
                                <Route path="/dashboard" element={<Dashboard/>}/>
                                <Route path="/profile" element={<Profile/>}/>

                                <Route path="/doctors" element={<Doctors/>}/>
                                <Route path="/doctors/:id" element={<DoctorDetail/>}/>

                                <Route path="/appointments" element={<Appointments/>}/>
                                <Route path="/appointments/book" element={<BookAppointment/>}/>

                                <Route path="/records" element={<MedicalRecords/>}/>
                                <Route path="/records/:id" element={<MedicalRecordDetail/>}/>

                                <Route path="/prescriptions" element={<Prescriptions />} />
                                <Route path="/prescriptions/:id" element={<PrescriptionDetail />} />

                                <Route path="/health" element={<HealthData/>}/>
                                <Route path="/ai/consultation" element={<AiConsultation/>}/>
                                <Route path="/ai/medication" element={<MedicationIdentifier/>}/>
                            </Route>
                        </Route>

                        <Route element={<DoctorProtectedRoute/>}>
                            <Route element={<DoctorLayout/>}>
                                <Route index element={<Navigate to="/doctor/dashboard" replace/>}/>
                                <Route path="/doctor/dashboard" element={<DoctorDashboard/>}/>
                                <Route path="/doctor/appointments" element={<DoctorAppointments/>}/>
                                <Route path="/doctor/clinical" element={<DoctorClinical/>}/>
                                <Route path="/doctor/patients" element={<DoctorPatients/>}/>
                                <Route path="/doctor/patient/:id" element={<DoctorPatientDetail/>}/>
                                <Route path="/doctor/ai-tools" element={<DoctorAiTools/>}/>
                                <Route path="/doctor/profile" element={<DoctorProfile/>}/>
                                <Route path="/doctor/income" element={<DoctorIncome/>}/>
                            </Route>
                        </Route>

                        {/* === ADMIN PORTAL ROUTES (MERGED) === */}
                        <Route element={<AdminProtectedRoute/>}> {/* <-- NEW PROTECTION */}
                            <Route path="/admin" element={<AdminLayout/>}>
                                <Route index element={<Navigate to="/admin/dashboard" replace/>}/>
                                <Route path="dashboard" element={<AdminDashboard/>}/>
                                <Route path="users" element={<UserManagement/>}/>
                                <Route path="doctors" element={<DoctorManagement/>}/>
                                <Route path="blockchain" element={<BlockchainVerify/>}/>
                                <Route path="register-admin" element={<AdminRegister/>}/>
                                <Route path="appointments" element={<AppointmentManagement />} />
                            </Route>
                        </Route>

                        {/* Redirect to a generic login */}
                        <Route path="*" element={<Navigate to="/login" replace/>}/>
                    </Routes>
                </AdminAuthProvider>
            </DoctorAuthProvider>
        </AuthProvider>
    )
}
