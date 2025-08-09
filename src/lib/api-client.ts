import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"

// Use the BACKEND_URL environment variable, defaulting to localhost:3001
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://teke-back-1-ten.vercel.app/"

const apiClient: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Optional: Add an interceptor to include authorization token
apiClient.interceptors.request.use(
    (config) => {
        // Example: Get token from localStorage or a global state management
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Optional: Add an interceptor for response error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("API Error Response:", error.response.data)
            console.error("API Error Status:", error.response.status)
            console.error("API Error Headers:", error.response.headers)
        } else if (error.request) {
            // The request was made but no response was received
            console.error("API Error Request:", error.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("API Error Message:", error.message)
        }
        return Promise.reject(error)
    },
)

export const api = {
    get: (url: string, config?: any): Promise<AxiosResponse<any>> => apiClient.get(url, config),
    post: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> => apiClient.post(url, data, config),
    put: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> => apiClient.put(url, data, config),
    patch: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> => apiClient.patch(url, data, config),
    del: (url: string, config?: any): Promise<AxiosResponse<any>> => apiClient.delete(url, config),
}
