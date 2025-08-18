import { api } from "@/lib/api-client"
import type {
    ApiResponse,
    AuthResponse,
    LoginDto,
    RegisterDto,
    User,
    UpdateUserStatusDto,
    Shipment,
    CreateShipmentDto,
    ApproveQuoteDto,
    UploadPodDto,
    PricingRule,
    CreatePricingRuleDto,
    UpdatePricingRuleDto,
    TransporterProfile,
    UpdateTransporterStatusDto,
    Vehicle,
    CreateFleetDto,
    UpdateFleetDto,
    RoutePlanData,
    PlanRouteDto,
    AdminDashboardData,
    AdminAnalyticsData,
} from "@/types/api"

interface UploadPodDto {
    photo: File;
    notes?: string;
    recipientName: string;
    recipientSignature?: string;
    latitude?: number;
    longitude?: number;
}

export const authService = {
    register: async (data: RegisterDto) => {
        return api.post<AuthResponse>("/auth/register", data)
    },
    login: async (data: LoginDto) => {
        return api.post<AuthResponse>("/auth/login", data)
    },
}

export const userService = {
    getAllUsers: async () => {
        return api.get<ApiResponse<User[]>>("/users")
    },
    getUserById: async (id: string) => {
        return api.get<ApiResponse<User>>(`/users/${id}`)
    },
    updateUserStatus: async (id: string, data: UpdateUserStatusDto) => {
        return api.patch<ApiResponse<User>>(`/users/${id}/status`, data)
    },
}

export const shipmentService = {
    createShipment: async (data: CreateShipmentDto) => {
        return api.post<ApiResponse<Shipment>>("/shipments", data)
    },
    getMyShipments: async () => {
        return api.get<ApiResponse<Shipment[]>>("/shipments")
    },
    approveShipment: async (data: { shipmentId: string, approvedPrice: number }) => {
        return await api.post('/shipments/approve', data)
    },
    rejectShipment: async (data: { shipmentId: string }) => {
        return await api.post('/shipments/reject', data)
    },
    approveQuote: async (id: string, quoteId: string, data: ApproveQuoteDto) => {
        return api.patch<ApiResponse<Shipment>>(`/shipments/${id}/approve/${quoteId}`, data)
    },
    rejectQuote: async (shipmentId: string, quoteId: string) => {
        // New method for rejecting a quote
        return api.patch<ApiResponse<Shipment>>(`/shipments/${shipmentId}/reject/${quoteId}`)
    },
    getAvailableRequests: async () => {
        return api.get<ApiResponse<Shipment[]>>("/shipments/available-requests")
    },
    submitQuote: async (id: string, data: any) => {
        return api.post<ApiResponse<Shipment>>(`/shipments/${id}/quote`, data)
    },
    getMyQuotes: async () => {
        return api.get<ApiResponse<Shipment[]>>("/shipments/my-quotes")
    },
    getMyActiveShipments: async () => {
        return api.get<ApiResponse<Shipment[]>>("/shipments/my-active-shipments")
    },
    updateShipmentStatus: async (id: string, data: any) => {
        return api.patch<ApiResponse<Shipment>>(`/shipments/${id}/status`, data)
    },
    getMyShipmentsAsTransporter: async () => {
        return api.get<ApiResponse<Shipment[]>>("/shipments/my-shipments-as-transporter")
    },
    getShipmentById: async (id: string) => {
        return api.get<ApiResponse<Shipment>>(`/shipments/${id}`)
    },
    uploadProofOfDelivery: async (id: string, data: UploadPodDto) => {
        const formData = new FormData();

        // Add the photo file
        formData.append('photo', data.photo);

        // Add other fields
        formData.append('recipientName', data.recipientName);
        if (data.notes) {
            formData.append('notes', data.notes);
        }
        if (data.recipientSignature) {
            formData.append('recipientSignature', data.recipientSignature);
        }
        if (data.latitude !== undefined) {
            formData.append('latitude', data.latitude.toString());
        }
        if (data.longitude !== undefined) {
            formData.append('longitude', data.longitude.toString());
        }

        return api.post<ApiResponse<any>>(`/shipments/${id}/delivery-proof`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateAdminStatus: async (id: string, data: any) => {
        return api.patch<ApiResponse<Shipment>>(`/shipments/${id}/admin-status`, data)
    },
}

export const pricingService = {
    getAllPricingRules: async () => {
        return api.get<ApiResponse<PricingRule[]>>("/pricing/rules")
    },
    createPricingRule: async (data: CreatePricingRuleDto) => {
        return api.post<ApiResponse<PricingRule>>("/pricing/rules", data)
    },
    updatePricingRule: async (id: string, data: UpdatePricingRuleDto) => {
        return api.patch<ApiResponse<PricingRule>>(`/pricing/rules/${id}`, data)
    },
    deletePriceRule: async (id: string) => {
        return api.del<ApiResponse<{ message: string }>>(`/pricing/rules/${id}/delete`)
    }
}

export const transporterService = {
    getTransporterById: async (id: string) => {
        return api.get<ApiResponse<any>>(`/transporters/${id}`)
    },

    getTransporterJobs: async () => {
        return api.get<ApiResponse<Shipment[]>>(`/transporters/jobs`)
    },

    acceptJob: async (shipmentId: string) => {
        return api.post<ApiResponse<any>>(
            `/transporters/jobs/${shipmentId}/accept`
        )
    },

    declineJob: async (shipmentId: string) => {
        return api.post<ApiResponse<any>>(
            `/transporters/jobs/${shipmentId}/decline`
        )
    },

    startPickup: async (shipmentId:string) => {
        // Make API call to start pickup and change status to 'in_transit'
        return await api.post(`/transporters/jobs/${shipmentId}/start-pickup`);
    },

    markAsDelivered: async (shipmentId:string) => {
        // Make API call to mark as delivered
        return await api.post(`/transporters/jobs/${shipmentId}/mark-delivered`);
    }
}

export const fleetService = {
    getAllVehicles: async () => {
        return api.get<ApiResponse<Vehicle[]>>("vehicles/my-vehicles")
    },
    addVehicle: async (data: CreateFleetDto) => {
        return api.post<ApiResponse<Vehicle>>("vehicles", data)
    },
    updateVehicle: async (id: string, data: UpdateFleetDto) => {
        return api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data)
    },
    deleteVehicle: async (id: string) => {
        return api.del<ApiResponse<null>>(`/vehicles/${id}`)
    },
}

export const trackingService = {
    planRoute: async (data: PlanRouteDto) => {
        return api.post<ApiResponse<RoutePlanData>>("/tracking/plan-route", data)
    },
    getShipmentRoute: async (id: string) => {
        return api.get<ApiResponse<RoutePlanData>>(`/tracking/shipment/${id}/route`)
    },
}

export const adminService = {
    getDashboardData: async () => {
        return api.get<ApiResponse<AdminDashboardData>>("/admin/dashboard")
    },
    getAnalyticsData: async () => {
        return api.get<ApiResponse<AdminAnalyticsData>>("/admin/analytics")
    },
    getAllShipments:async () => {
        return api.get<ApiResponse<Shipment[]>>("/admin/shipments")
    }
}


// Mock global fuel price for demonstration purposes, as it's not part of the API services
let currentFuelPricePerLitre = 1.5

export const updateGlobalFuelPrice = (price: number) => {
    currentFuelPricePerLitre = price
}

export const getGlobalFuelPrice = () => {
    return currentFuelPricePerLitre
}


// Customer Analytics Service
export const customerAnalyticsService = {
    getDashboardData: async () => {
        return api.get<ApiResponse<CustomerDashboardData>>("/analytics/customer/dashboard")
    },
    getCustomerAnalytics: async (customerId: string) => {
        return api.get<ApiResponse<CustomerAnalyticsData>>(`/analytics/customer/${customerId}`)
    },
}

// Admin Analytics Service
export const adminAnalyticsService = {
    getDashboardData: async () => {
        return api.get<ApiResponse<AdminDashboardData>>("/analytics/admin/dashboard")
    },
}

// Transporter Analytics Service
export const transporterAnalyticsService = {
    getDashboardData: async () => {
        return api.get<ApiResponse<TransporterDashboardData>>("/analytics/transporter/dashboard")
    },
    getTransporterAnalytics: async (transporterId: string) => {
        return api.get<ApiResponse<TransporterAnalyticsData>>(`/analytics/transporter/${transporterId}`)
    },
}

// System Analytics Service
export const systemAnalyticsService = {
    getOverview: async () => {
        return api.get<ApiResponse<SystemOverviewData>>("/analytics/system/overview")
    },
    getRealtimeData: async () => {
        return api.get<ApiResponse<RealtimeData>>("/analytics/realtime")
    },
}

// Combined Analytics Service (if you prefer a single service)
export const analyticsService = {
    // Customer endpoints
    getCustomerDashboard: async () => {
        return api.get<ApiResponse<CustomerDashboardData>>("/analytics/customer/dashboard")
    },
    getCustomerAnalytics: async (customerId: string) => {
        return api.get<ApiResponse<CustomerAnalyticsData>>(`/analytics/customer/${customerId}`)
    },

    // Admin endpoints
    getAdminDashboard: async () => {
        return api.get<ApiResponse<AdminDashboardData>>("/analytics/admin/dashboard")
    },

    // Transporter endpoints
    getTransporterDashboard: async () => {
        return api.get<ApiResponse<TransporterDashboardData>>("/analytics/transporter/dashboard")
    },
    getTransporterAnalytics: async (transporterId: string) => {
        return api.get<ApiResponse<TransporterAnalyticsData>>(`/analytics/transporter/${transporterId}`)
    },

    // System endpoints
    getSystemOverview: async () => {
        return api.get<ApiResponse<SystemOverviewData>>("/analytics/system/overview")
    },
    getRealtimeData: async () => {
        return api.get<ApiResponse<RealtimeData>>("/analytics/realtime")
    },
}