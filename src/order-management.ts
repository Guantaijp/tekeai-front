// Types for Order Management
import { api } from "@/lib/api-client"

export interface Order {
    id: number
    orderNumber: string
    type: OrderType
    status: OrderStatus
    buyerEmail?: string
    totalAmount: number
    createdAt: string
    updatedAt: string
    items: OrderItem[]
    lpoFilePath?: string
    cancellationReason?: string
}

export interface OrderItem {
    id: number
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export enum OrderType {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    TRANSFER = "TRANSFER",
    RECEIVED = "RECEIVED",
}

export enum OrderStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    DISPATCH = "Dispatch",
    DELIVERED = "Delivered",
    CANCELLED = "Cancelled",
}

export interface CreateOrderDto {
    type: OrderType
    buyerEmail?: string
    items: Omit<OrderItem, "id">[]
    notes?: string
    expectedDeliveryDate?: string
}

export interface UpdateOrderStatusDto {
    status: OrderStatus
    notes?: string
}

export interface SendOrderInviteDto {
    customerEmail: string
    message?: string
}

export interface OrderFilters {
    type?: OrderType
    status?: OrderStatus
    page?: number
    limit?: number
}

export interface OrderSearchParams {
    q: string
    type?: OrderType
}

export interface OrderStats {
    totalOrders: number
    pendingOrders: number
    approvedOrders: number
    dispatchedOrders: number
    deliveredOrders: number
    cancelledOrders: number
    totalRevenue: number
    averageOrderValue: number
}

export interface PaginatedOrders {
    orders: Order[]
    totalCount: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export interface UploadLPOResponse {
    message: string
    order: Order
    fileUrl: string
}

export interface OrderInviteResponse {
    message: string
    orderLink: string
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
    errors?: string[]
}

// Order Management Service
export const orderService = {
    // Get all orders with filtering and pagination
    getOrders: async (filters: OrderFilters = {}) => {
        const params = new URLSearchParams()

        if (filters.type) params.append("type", filters.type)
        if (filters.status) params.append("status", filters.status)
        if (filters.page) params.append("page", filters.page.toString())
        if (filters.limit) params.append("limit", filters.limit.toString())

        const queryString = params.toString() ? `?${params.toString()}` : ""
        return api.get<ApiResponse<PaginatedOrders>>(`/orders${queryString}`)
    },

    // Get received orders (acting as seller)
    getReceivedOrders: async (filters: Omit<OrderFilters, "type"> = {}) => {
        const params = new URLSearchParams()

        if (filters.status) params.append("status", filters.status)
        if (filters.page) params.append("page", filters.page.toString())
        if (filters.limit) params.append("limit", filters.limit.toString())

        const queryString = params.toString() ? `?${params.toString()}` : ""
        return api.get<ApiResponse<PaginatedOrders>>(`/orders/received${queryString}`)
    },

    // Get sent orders (acting as buyer)
    getSentOrders: async (filters: Omit<OrderFilters, "type"> = {}) => {
        const params = new URLSearchParams()

        if (filters.status) params.append("status", filters.status)
        if (filters.page) params.append("page", filters.page.toString())
        if (filters.limit) params.append("limit", filters.limit.toString())

        const queryString = params.toString() ? `?${params.toString()}` : ""
        return api.get<ApiResponse<PaginatedOrders>>(`/orders/sent${queryString}`)
    },

    // Get order statistics
    getOrderStats: async () => {
        return api.get<ApiResponse<OrderStats>>("/orders/stats")
    },

    // Search orders
    searchOrders: async (searchParams: OrderSearchParams) => {
        const params = new URLSearchParams()
        params.append("q", searchParams.q)
        if (searchParams.type) params.append("type", searchParams.type)

        return api.get<ApiResponse<Order[]>>(`/orders/search?${params.toString()}`)
    },

    // Get single order by ID
    getOrderById: async (id: number) => {
        return api.get<ApiResponse<Order>>(`/orders/${id}`)
    },

    // Create new order (sent to supplier)
    createOrder: async (orderData: CreateOrderDto) => {
        return api.post<ApiResponse<Order>>("/orders", orderData)
    },

    // Add received order manually (offline channel)
    addReceivedOrder: async (orderData: CreateOrderDto) => {
        return api.post<ApiResponse<Order>>("/orders/received", orderData)
    },

    // Send order invite to customer
    sendOrderInvite: async (inviteData: SendOrderInviteDto) => {
        return api.post<ApiResponse<OrderInviteResponse>>("/orders/invite", inviteData)
    },

    // Update order status
    updateOrderStatus: async (id: number, statusData: UpdateOrderStatusDto) => {
        return api.put<ApiResponse<Order>>(`/orders/${id}/status`, statusData)
    },

    // Approve order (shortcut for status update)
    approveOrder: async (id: number) => {
        return api.put<ApiResponse<Order>>(`/orders/${id}/approve`, {})
    },

    // Mark order for dispatch
    markForDispatch: async (id: number) => {
        return api.put<ApiResponse<Order>>(`/orders/${id}/dispatch`, {})
    },

    // Cancel order
    cancelOrder: async (id: number, reason?: string) => {
        const data = reason ? { reason } : {}
        return api.put<ApiResponse<Order>>(`/orders/${id}/cancel`, data)
    },

    // Upload LPO file
    uploadLPO: async (id: number, file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        return api.post<ApiResponse<UploadLPOResponse>>(`/orders/${id}/upload-lpo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    },

    // Utility methods for better UX
    utils: {
        // Get orders by status
        getOrdersByStatus: async (status: OrderStatus, page = 1, limit = 10) => {
            return orderService.getOrders({ status, page, limit })
        },

        // Get orders by type
        getOrdersByType: async (type: OrderType, page = 1, limit = 10) => {
            return orderService.getOrders({ type, page, limit })
        },

        // Get pending orders
        getPendingOrders: async (page = 1, limit = 10) => {
            return orderService.getOrders({ status: OrderStatus.PENDING, page, limit })
        },

        // Get recent orders
        getRecentOrders: async (limit = 5) => {
            return orderService.getOrders({ page: 1, limit })
        },

        // Check if order can be cancelled
        canCancelOrder: (order: Order): boolean => {
            return [OrderStatus.PENDING, OrderStatus.APPROVED].includes(order.status)
        },

        // Check if order can be approved
        canApproveOrder: (order: Order): boolean => {
            return order.status === OrderStatus.PENDING
        },

        // Check if order can be dispatched
        canDispatchOrder: (order: Order): boolean => {
            return order.status === OrderStatus.APPROVED
        },

        // Format order number for display
        formatOrderNumber: (orderNumber: string): string => {
            return orderNumber.toUpperCase()
        },

        // Calculate total order value from items
        calculateOrderTotal: (items: OrderItem[]): number => {
            return items.reduce((total, item) => total + item.totalPrice, 0)
        },

        // Get status color for UI
        getStatusColor: (status: OrderStatus): string => {
            const colors = {
                [OrderStatus.PENDING]: "orange",
                [OrderStatus.APPROVED]: "blue",
                [OrderStatus.REJECTED]: "red",
                [OrderStatus.DISPATCH]: "purple",
                [OrderStatus.DELIVERED]: "green",
                [OrderStatus.CANCELLED]: "gray",
            }
            return colors[status] || "gray"
        },

        // Get status display text
        getStatusText: (status: OrderStatus): string => {
            const texts = {
                [OrderStatus.PENDING]: "Pending Approval",
                [OrderStatus.APPROVED]: "Approved",
                [OrderStatus.REJECTED]: "Rejected",
                [OrderStatus.DISPATCH]: "Ready for Dispatch",
                [OrderStatus.DELIVERED]: "Delivered",
                [OrderStatus.CANCELLED]: "Cancelled",
            }
            return texts[status] || status
        },
    },
}

// Export individual services if you prefer separation
export const orderQueryService = {
    getOrders: orderService.getOrders,
    getReceivedOrders: orderService.getReceivedOrders,
    getSentOrders: orderService.getSentOrders,
    getOrderStats: orderService.getOrderStats,
    searchOrders: orderService.searchOrders,
    getOrderById: orderService.getOrderById,
}

export const orderMutationService = {
    createOrder: orderService.createOrder,
    addReceivedOrder: orderService.addReceivedOrder,
    sendOrderInvite: orderService.sendOrderInvite,
    updateOrderStatus: orderService.updateOrderStatus,
    approveOrder: orderService.approveOrder,
    markForDispatch: orderService.markForDispatch,
    cancelOrder: orderService.cancelOrder,
    uploadLPO: orderService.uploadLPO,
}

export const orderUtilService = orderService.utils
