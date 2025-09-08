import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/"
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://teke-back-1-nu.vercel.app/"

const apiClient: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

apiClient.interceptors.request.use(
    (config) => {
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

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
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
