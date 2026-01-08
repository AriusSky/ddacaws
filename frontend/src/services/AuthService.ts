import api from './api'; // Import your new client

// Match the Interface to the API Document "Output Example"
export interface LoginResponse {
  token: string;
  userId: number;
  role: 'Patient' | 'Doctor' | 'Admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  userRole: string;
}

export const authService = {
  // POST /api/auth/login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data; 
  },

  // POST /api/auth/register
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', data);
  }
};