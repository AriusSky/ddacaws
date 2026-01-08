// frontend/src/services/AdminServices.ts

import { http } from '../api/http';
import type { User, AdminAppointment, SystemStats, AnalyticsData, BlockchainStatus } from '../types';

export const adminService = {

    // === Dashboard Endpoints ===

    // GET /api/admin/stats
    getSystemStats: async (): Promise<SystemStats> => {
        const response = await http.get('/admin/stats');
        return response.data;
    },

    // GET /api/admin/appointments (filtered client-side for "today")
    getTodaysAppointments: async (): Promise<AdminAppointment[]> => {
        const res = await http.get<{ appointments: AdminAppointment[] }>('/admin/appointments');
        const appointments = res.data.appointments
        const today = new Date().toISOString().split('T')[0];
        return appointments?.filter((app: AdminAppointment) => app.appointmentDate.startsWith(today));
    },

    // GET /api/admin/analytics/appointments
    getAppointmentAnalytics: async (): Promise<AnalyticsData[]> => {
        const response = await http.get('/admin/analytics/appointments');
        return response.data;
    },


    // === User & Doctor Management Endpoints ===

    // GET /api/admin/users
    getUsers: async (role?: string): Promise<{ users: User[], totalCount: number }> => {
        const params = new URLSearchParams();
        if (role) {
            params.append('role', role);
        }
        const response = await http.get(`/admin/users?${params.toString()}`);
        return response.data;
    },

    // A helper that uses the main getUsers endpoint for clarity
    getAllDoctors: async (): Promise<User[]> => {
        const { users } = await adminService.getUsers("Doctor");
        return users;
    },

    // A helper to get doctors who are not yet active
    getPendingDoctors: async (): Promise<User[]> => {
        const response = await http.get<{ users: User[] }>('/admin/users?role=Doctor&isActive=false');
        return response.data.users;
    },

    updateUser: async (userId: number, data: { fullName?: string; email?: string; role?: string; isActive?: boolean }): Promise<void> => {
        await http.put(`/admin/users/${userId}`, data);
    },

    // 'toggleUserStatus' is now a convenience function that calls the more generic 'updateUser'.
    toggleUserStatus: async (userId: number, currentStatus: boolean): Promise<void> => {
        await adminService.updateUser(userId, { isActive: !currentStatus });
    },

    // DELETE /api/admin/users/{id}
    deleteUser: async (userId: number): Promise<void> => {
        await http.delete(`/admin/users/${userId}`);
    },


    // === Appointment Management Endpoints ===

    // GET /api/admin/appointments
    getAllAppointments: async (): Promise<{ appointments: AdminAppointment[], totalCount: number }> => {
        const response = await http.get('/admin/appointments');
        return response.data;
    },

    // PUT /api/admin/appointments/{id}
    updateAppointment: async (id: number, data: { appointmentDate: string, status: string }): Promise<void> => {
        await http.put(`/admin/appointments/${id}`, data);
    },


    // === Blockchain Endpoint ===

    // GET /api/blockchain/verify
    verifyBlockchain: async (): Promise<BlockchainStatus> => {
        const response = await http.get('/blockchain/verify');
        return response.data;
    },


    // === Other Admin Actions ===

    // POST /auth/register (Admin creating another admin)
    registerAdmin: async (data: { fullName: string, email: string, password: string }): Promise<void> => {
        await http.post('/auth/register', { ...data, role: 'Admin' });
    }
};
