
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5101/api");

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error("Missing VITE_API_URL in production build!");
}

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});


http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    console.log('[HTTP Interceptor] Token from localStorage:', token ? 'Present' : 'Missing')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('[HTTP Interceptor] Authorization header set')
    } else {
        console.log('[HTTP Interceptor] No token found - request will be unauthorized')
    }
    // Don't force Content-Type for FormData - let axios handle it
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    }
    return config
})

// Add response interceptor to handle 401 errors
http.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect for login/register endpoints - let them handle their own errors
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
        
        if (error.response?.status === 401 && !isAuthEndpoint) {
            console.log('[HTTP Interceptor] 401 Unauthorized - clearing token and redirecting to login')
            localStorage.removeItem('token')
            // Redirect to appropriate login page based on current path
            if (window.location.pathname.startsWith('/doctor')) {
                window.location.href = '/doctor/login'
            } else {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Helper function to create an axios instance with a specific token
export function createAuthenticatedHttp(token: string) {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    // Add logging to see what's being sent
    instance.interceptors.request.use((config) => {
        console.log('[HTTP] Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        })
        return config
    })
    // Add response logging to see what we get back
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.log('[HTTP] Response Error:', {
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            })
            return Promise.reject(error)
        }
    )
    return instance
}