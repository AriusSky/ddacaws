import { http, createAuthenticatedHttp } from './http'
import type { Profile } from '../types'

export async function loginApi(data: { email: string; password: string }) {
    const res = await http.post('/auth/login', data) 
    return res.data as { token: string }
}

export async function registerApi(data: {
    email: string
    password: string
    fullName: string
    phoneNumber?: string
    dateOfBirth?: string
    gender?: string
    address?: string
}) {
    const res = await http.post('/auth/register', data)
    return res.data
}

export async function getProfile(token?: string) {
    const httpClient = token ? createAuthenticatedHttp(token) : http
    const res = await httpClient.get('/auth/profile')
    return res.data as Profile
}

export async function uploadProfileImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await http.post('/auth/upload-picture', formData)
    return res.data as { fileUrl: string; fileKey: string }
}

export async function updateProfile(data: Partial<Profile>) {
    const res = await http.put('/auth/profile', data)
    return res.data as Profile
}
