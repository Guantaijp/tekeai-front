"use client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Package, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { OrderTable, type Order } from "@/components/orders/order-table"
import { OrderStats } from "@/components/orders/order-stats"
import { OrderFilters } from "@/components/orders/order-filters"
import { ShareOrderingLinkModal } from "@/components/orders/share-ordering-link-modal"
import { AddReceivedOrderModal } from "@/components/orders/add-received-order-modal"
import { CreateOrderModal } from "@/components/orders/create-order-modal"
import { OrderDetailsModal } from "@/components/orders/order-details-modal" // Import the new modal
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { OrderStatus } from "@/components/orders/order-status-badge"
import { orderService, OrderStatus as ApiOrderStatus } from "@/order-management"

interface LoadingState {
    received: boolean
    sent: boolean
    stats: boolean
}

interface ErrorState {
    received: string | null
    sent: string | null
    stats: string | null
}

// Extended Order interface to include the numeric database ID
interface ExtendedOrder extends Order {
    dbId: number // Add the numeric database ID
}

export function OrderManagementDashboard() {
    const [activeTab, setActiveTab] = useState("received")

    // API Data State - Updated to use ExtendedOrder
    const [receivedOrders, setReceivedOrders] = useState<ExtendedOrder[]>([])
    console.log("recievedOrders", receivedOrders)
    const [sentOrders, setSentOrders] = useState<ExtendedOrder[]>([])
    const [orderStats, setOrderStats] = useState(null)

    // Filtered Data State - Updated to use ExtendedOrder
    const [filteredReceivedOrders, setFilteredReceivedOrders] = useState<ExtendedOrder[]>([])
    const [filteredSentOrders, setFilteredSentOrders] = useState<ExtendedOrder[]>([])

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // Loading & Error States
    const [loading, setLoading] = useState<LoadingState>({
        received: true,
        sent: true,
        stats: true,
    })
    const [errors, setErrors] = useState<ErrorState>({
        received: null,
        sent: null,
        stats: null,
    })

    // Pagination State
    const [pagination, setPagination] = useState({
        received: { page: 1, limit: 10, totalPages: 0 },
        sent: { page: 1, limit: 10, totalPages: 0 },
    })

    // Transform API order to component order format
    const transformOrder = (apiOrder: any, type: "received" | "sent"): ExtendedOrder => {
        return {
            id: apiOrder.orderNumber, // Keep as order number for display
            dbId: apiOrder.id, // Store the numeric database ID
            date: new Date(apiOrder.createdAt).toISOString().split("T")[0],
            items: apiOrder.items.map((item: any) => item.productName).join(", "),
            quantity: apiOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
            buyer: type === "received" ? apiOrder.buyerName || "Unknown" : undefined,
            supplier: type === "sent" ? "Supplier Name" : undefined,
            location: type === "received" ?apiOrder.destination || "Location" : undefined,
            destination: type === "sent" ? "Destination" : undefined,
            lpo: !!apiOrder.lpoFilePath,
            amount: apiOrder.totalAmount,
            status: transformStatus(apiOrder.status),
            type: type,
        }
    }

    // Transform API status to component status
    const transformStatus = (apiStatus: ApiOrderStatus): OrderStatus => {
        const statusMap: Record<ApiOrderStatus, OrderStatus> = {
            [ApiOrderStatus.RECEIVED]: "Received",
            [ApiOrderStatus.APPROVED]: "Approved",
            [ApiOrderStatus.DISPATCH]: "Dispatch",
            [ApiOrderStatus.SENT]: "Sent",
            [ApiOrderStatus.DELIVERED]: "Delivered",
            [ApiOrderStatus.CANCELLED]: "Cancelled",
        }
        return statusMap[apiStatus] || "Received"
    }

    // Transform component status back to API status
    const transformStatusToApi = (status: OrderStatus): ApiOrderStatus => {
        const statusMap: Record<OrderStatus, ApiOrderStatus> = {
            Received: ApiOrderStatus.RECEIVED,
            Approved: ApiOrderStatus.APPROVED,
            Dispatch: ApiOrderStatus.DISPATCH,
            Sent: ApiOrderStatus.SENT,
            Delivered: ApiOrderStatus.DELIVERED,
            Cancelled: ApiOrderStatus.CANCELLED,
        }
        return statusMap[status] || ApiOrderStatus.RECEIVED
    }

    // Fetch received orders
    const fetchReceivedOrders = async (page = 1, limit = 10) => {
        try {
            setLoading((prev) => ({ ...prev, received: true }))
            setErrors((prev) => ({ ...prev, received: null }))

            const response = await orderService.getReceivedOrders({ page, limit })

            // Handle the actual response structure based on your API response
            const responseData = response.data || response

            if (responseData.orders) {
                const orders = responseData.orders.map((order: any) => transformOrder(order, "received"))
                console.log("orders",orders)
                setReceivedOrders(orders)
                setFilteredReceivedOrders(orders)
                setPagination((prev) => ({
                    ...prev,
                    received: {
                        page: page, // Use the requested page since API doesn't return currentPage
                        limit,
                        totalPages: responseData.totalPages || Math.ceil((responseData.total || 0) / limit),
                    },
                }))
            } else {
                // Handle case where no orders are returned
                setReceivedOrders([])
                setFilteredReceivedOrders([])
                setPagination((prev) => ({
                    ...prev,
                    received: {
                        page: 1,
                        limit,
                        totalPages: 1,
                    },
                }))
            }
        } catch (error: any) {
            console.error("Error fetching received orders:", error)
            setErrors((prev) => ({
                ...prev,
                received: error.response?.data?.message || error.message || "Failed to fetch received orders",
            }))
        } finally {
            setLoading((prev) => ({ ...prev, received: false }))
        }
    }

    // Fetch sent orders
    const fetchSentOrders = async (page = 1, limit = 10) => {
        try {
            setLoading((prev) => ({ ...prev, sent: true }))
            setErrors((prev) => ({ ...prev, sent: null }))

            const response = await orderService.getSentOrders({ page, limit })

            // Handle the actual response structure based on your API response
            const responseData = response.data || response

            if (responseData.orders) {
                const orders = responseData.orders.map((order: any) => transformOrder(order, "sent"))
                setSentOrders(orders)
                setFilteredSentOrders(orders)
                setPagination((prev) => ({
                    ...prev,
                    sent: {
                        page: page, // Use the requested page since API doesn't return currentPage
                        limit,
                        totalPages: responseData.totalPages || Math.ceil((responseData.total || 0) / limit),
                    },
                }))
            } else {
                // Handle case where no orders are returned
                setSentOrders([])
                setFilteredSentOrders([])
                setPagination((prev) => ({
                    ...prev,
                    sent: {
                        page: 1,
                        limit,
                        totalPages: 1,
                    },
                }))
            }
        } catch (error: any) {
            console.error("Error fetching sent orders:", error)
            setErrors((prev) => ({
                ...prev,
                sent: error.response?.data?.message || error.message || "Failed to fetch sent orders",
            }))
        } finally {
            setLoading((prev) => ({ ...prev, sent: false }))
        }
    }

    // Fetch order statistics
    const fetchOrderStats = async () => {
        try {
            setLoading((prev) => ({ ...prev, stats: true }))
            setErrors((prev) => ({ ...prev, stats: null }))

            const response = await orderService.getOrderStats()

            if (response.data.success) {
                setOrderStats(response.data.data)
            }
        } catch (error: any) {
            console.error("Error fetching order stats:", error)
            setErrors((prev) => ({
                ...prev,
                stats: error.message || "Failed to fetch order statistics",
            }))
        } finally {
            setLoading((prev) => ({ ...prev, stats: false }))
        }
    }

    // Initial data fetch
    useEffect(() => {
        fetchReceivedOrders()
        fetchSentOrders()
        fetchOrderStats()
    }, [])

    // Handle status change - FIXED to use the numeric database ID
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const apiStatus = transformStatusToApi(newStatus)

            // Find the order to get its numeric database ID
            const currentOrders = activeTab === "received" ? receivedOrders : sentOrders
            const orderToUpdate = currentOrders.find(order => order.id === orderId)

            if (!orderToUpdate) {
                console.error("Order not found:", orderId)
                return
            }

            // Use the numeric database ID from the order object
            await orderService.updateOrderStatus(orderToUpdate.dbId, {
                status: apiStatus,
                notes: `Status updated to ${newStatus}`,
            })

            // Update local state
            if (activeTab === "received") {
                const updatedOrders = receivedOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order,
                )
                setReceivedOrders(updatedOrders)
                setFilteredReceivedOrders(
                    filteredReceivedOrders.map((order) =>
                        order.id === orderId ? { ...order, status: newStatus } : order,
                    )
                )
            } else {
                const updatedOrders = sentOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order,
                )
                setSentOrders(updatedOrders)
                setFilteredSentOrders(
                    filteredSentOrders.map((order) =>
                        order.id === orderId ? { ...order, status: newStatus } : order,
                    )
                )
            }

            // Update selected order if it's the one being updated
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }

            // Refresh stats
            fetchOrderStats()
        } catch (error: any) {
            console.error("Error updating order status:", error)
            // You might want to show a toast notification here
            alert(`Failed to update order status: ${error.response?.data?.message || error.message}`)
        }
    }

    // Handle view details
    const handleViewDetails = (orderId: string) => {
        const currentOrders = activeTab === "received" ? filteredReceivedOrders : filteredSentOrders
        const order = currentOrders.find(order => order.id === orderId)

        if (order) {
            setSelectedOrder(order)
            setIsDetailsModalOpen(true)
        }
    }

    // Handle close details modal
    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false)
        setSelectedOrder(null)
    }

    // Handle order added
    const handleOrderAdded = async (newOrder: Order) => {
        // Refresh the appropriate orders list
        if (newOrder.type === "received") {
            await fetchReceivedOrders()
        } else {
            await fetchSentOrders()
        }
        // Refresh stats
        await fetchOrderStats()
    }

    // Handle search
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            // Reset to original data
            if (activeTab === "received") {
                setFilteredReceivedOrders(receivedOrders)
            } else {
                setFilteredSentOrders(sentOrders)
            }
            return
        }

        try {
            const response = await orderService.searchOrders({ q: query })

            if (response.data.success) {
                const searchResults = response.data.data.map((order: any) =>
                    transformOrder(order, activeTab as "received" | "sent"),
                )

                if (activeTab === "received") {
                    setFilteredReceivedOrders(searchResults.filter((order: ExtendedOrder) => order.type === "received"))
                } else {
                    setFilteredSentOrders(searchResults.filter((order: ExtendedOrder) => order.type === "sent"))
                }
            }
        } catch (error: any) {
            console.error("Error searching orders:", error)
            // Fallback to local search
            const currentOrders = activeTab === "received" ? receivedOrders : sentOrders
            const filtered = currentOrders.filter(
                (order) =>
                    order.id.toLowerCase().includes(query.toLowerCase()) ||
                    order.items.toLowerCase().includes(query.toLowerCase()) ||
                    (order.buyer && order.buyer.toLowerCase().includes(query.toLowerCase())) ||
                    (order.supplier && order.supplier.toLowerCase().includes(query.toLowerCase())),
            )

            if (activeTab === "received") {
                setFilteredReceivedOrders(filtered)
            } else {
                setFilteredSentOrders(filtered)
            }
        }
    }

    // Handle status filter
    const handleStatusFilter = (status: OrderStatus | "all") => {
        const currentOrders = activeTab === "received" ? receivedOrders : sentOrders
        const filtered = status === "all" ? currentOrders : currentOrders.filter((order) => order.status === status)

        if (activeTab === "received") {
            setFilteredReceivedOrders(filtered)
        } else {
            setFilteredSentOrders(filtered)
        }
    }

    // Handle clear filters
    const handleClearFilters = () => {
        if (activeTab === "received") {
            setFilteredReceivedOrders(receivedOrders)
        } else {
            setFilteredSentOrders(sentOrders)
        }
    }

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        // Clear any search/filter state when switching tabs
        handleClearFilters()
    }

    const currentOrders = activeTab === "received" ? filteredReceivedOrders : filteredSentOrders
    const isLoading = activeTab === "received" ? loading.received : loading.sent
    const currentError = activeTab === "received" ? errors.received : errors.sent

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
                    <p className="text-muted-foreground">
                        Manage incoming customer orders and place your own orders with suppliers.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <ShareOrderingLinkModal />
                    <AddReceivedOrderModal onOrderAdded={handleOrderAdded} />
                    <CreateOrderModal onOrderCreated={handleOrderAdded} />
                </div>
            </div>

            {/* Stats */}
            {loading.stats ? (
                <Card className="p-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading statistics...</span>
                    </div>
                </Card>
            ) : errors.stats ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.stats}</AlertDescription>
                </Alert>
            ) : (
                <OrderStats orders={currentOrders} stats={orderStats} />
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                    <TabsTrigger value="received" className="gap-2">
                        <Package className="h-4 w-4" />
                        Received Orders
                        {loading.received && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Sent Orders
                        {loading.sent && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                    </TabsTrigger>
                </TabsList>

                {/* Filters */}
                <OrderFilters
                    onSearch={handleSearch}
                    onStatusFilter={handleStatusFilter}
                    onClearFilters={handleClearFilters}
                    disabled={isLoading}
                />

                {/* Error Display */}
                {currentError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {currentError}
                            <button
                                onClick={() => (activeTab === "received" ? fetchReceivedOrders() : fetchSentOrders())}
                                className="ml-2 underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Received Orders Tab */}
                <TabsContent value="received" className="space-y-4">
                    <Card>
                        {loading.received ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-3">Loading received orders...</span>
                            </div>
                        ) : (
                            <OrderTable
                                orders={filteredReceivedOrders}
                                type="received"
                                onStatusChange={handleStatusChange}
                                onViewDetails={handleViewDetails}
                                loading={loading.received}
                            />
                        )}
                    </Card>

                    {/* Pagination for received orders */}
                    {pagination.received.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => fetchReceivedOrders(pagination.received.page - 1)}
                                disabled={pagination.received.page <= 1 || loading.received}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                Page {pagination.received.page} of {pagination.received.totalPages}
              </span>
                            <button
                                onClick={() => fetchReceivedOrders(pagination.received.page + 1)}
                                disabled={pagination.received.page >= pagination.received.totalPages || loading.received}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </TabsContent>

                {/* Sent Orders Tab */}
                <TabsContent value="sent" className="space-y-4">
                    <Card>
                        {loading.sent ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-3">Loading sent orders...</span>
                            </div>
                        ) : (
                            <OrderTable
                                orders={filteredSentOrders}
                                type="sent"
                                onStatusChange={handleStatusChange}
                                onViewDetails={handleViewDetails}
                                loading={loading.sent}
                            />
                        )}
                    </Card>

                    {/* Pagination for sent orders */}
                    {pagination.sent.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => fetchSentOrders(pagination.sent.page - 1)}
                                disabled={pagination.sent.page <= 1 || loading.sent}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                Page {pagination.sent.page} of {pagination.sent.totalPages}
              </span>
                            <button
                                onClick={() => fetchSentOrders(pagination.sent.page + 1)}
                                disabled={pagination.sent.page >= pagination.sent.totalPages || loading.sent}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
            />
        </div>
    )
}