"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Activity, CheckCircle, User, DollarSign, Clock, Send } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react";
import { customerAnalyticsService, } from "@/index";
import {orderService} from "@/order-management";

// Define types for the API response data
interface CustomerDashboardData {
    totalOrders: number;
    activeDeliveries: number;
    completedDeliveries: number;
    newRequests: number;
    shipmentsOverview: Array<{
        month: string;
        value: number;
        count: number;
    }>;
    totalSpent: number;
    averageOrderValue: number;
}

interface OrderStats {
    totalOrders: number;
    receivedOrders: number;
    sentOrders: number;
    pendingApproval: number;
    readyForDispatch: number;
    totalRevenue: number;
}

interface LoadingState {
    dashboard: boolean;
    stats: boolean;
}

interface ErrorState {
    dashboard: string | null;
    stats: string | null;
}

const chartConfig = {
    count: {
        label: "Shipments",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function DashboardOverview() {
    const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    console.log("orderstat",orderStats)
    const [loading, setLoading] = useState<LoadingState>({
        dashboard: true,
        stats: true
    });
    const [errors, setErrors] = useState<ErrorState>({
        dashboard: null,
        stats: null
    });
    const [storedName, setStoredName] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        console.log("Value in localStorage:", role);
        setStoredName(role);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading((prev) => ({ ...prev, dashboard: true }));
            setErrors((prev) => ({ ...prev, dashboard: null }));

            const response = await customerAnalyticsService.getDashboardData();
            setDashboardData(response.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setErrors((prev) => ({
                ...prev,
                dashboard: 'Failed to load dashboard data'
            }));
        } finally {
            setLoading((prev) => ({ ...prev, dashboard: false }));
        }
    };

    const fetchOrderStats = async () => {
        try {
            setLoading((prev) => ({ ...prev, stats: true }));
            setErrors((prev) => ({ ...prev, stats: null }));

            const response = await orderService.getOrderStats();
            console.log(response);

            // if (response.data.success) {
                setOrderStats(response.data);
            // }
        } catch (error: any) {
            console.error("Error fetching order stats:", error);
            setErrors((prev) => ({
                ...prev,
                stats: error.message || "Failed to fetch order statistics",
            }));
        } finally {
            setLoading((prev) => ({ ...prev, stats: false }));
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchOrderStats();
    }, []);

    const isLoading = loading.dashboard || loading.stats;
    const hasErrors = errors.dashboard || errors.stats;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full bg-gray-200 rounded animate-pulse"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (hasErrors) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-500">
                            {errors.dashboard && <p>{errors.dashboard}</p>}
                            {errors.stats && <p>{errors.stats}</p>}
                            <button
                                onClick={() => {
                                    fetchDashboardData();
                                    fetchOrderStats();
                                }}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    Welcome,{" "}
                    <span className="text-blue-600">
                        {storedName}
                    </span>
                    !
                </h2>
                <p className="text-gray-600">Here's your shipment overview</p>
            </div>

            {/* Original Dashboard Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalOrders?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">Sum of all order statuses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.activeDeliveries || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently in transit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.completedDeliveries || 0}</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Requests</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.newRequests || 0}</div>
                        <p className="text-xs text-muted-foreground">Pending processing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Order Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Received Orders</CardTitle>
                        <Package className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.receivedOrders || 0}</div>
                        <p className="text-xs text-muted-foreground">Orders received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent Orders</CardTitle>
                        <Send className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.sentOrders || 0}</div>
                        <p className="text-xs text-muted-foreground">Orders dispatched</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.pendingApproval || 0}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Dispatch</CardTitle>
                        <Truck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.readyForDispatch || 0}</div>
                        <p className="text-xs text-muted-foreground">Ready to ship</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ksh{orderStats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Total earnings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Shipments Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Shipments Overview</CardTitle>
                    <CardDescription>Monthly shipments data</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <BarChart accessibilityLayer data={dashboardData?.shipmentsOverview || []}>
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}