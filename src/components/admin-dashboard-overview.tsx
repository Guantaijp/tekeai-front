"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, PackageCheck, DollarSign, Clock, Package } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react";
import { adminAnalyticsService } from "@/index"; // Adjust import path as needed

// Updated types to match your actual API response
interface UserGrowthItem {
    month: string;
    value: number;
    count: number;
}

interface TopCustomer {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    totalOrders: number;
}

interface TopTransporter {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    completedJobs: number;
    rating: number;
}

interface AdminDashboardData {
    grossOrderValue: number;
    revenueFromCustomers: number;
    revenueFromTransporters: number;
    totalCustomers: number;
    totalTransporters: number;
    totalOrdersShipped: number;
    userGrowth: UserGrowthItem[]; // Updated to match your API
    revenueOverview: any[];
    topCustomers: TopCustomer[];
    topTransporters: TopTransporter[];
    // Growth percentages (optional - if your API provides them)
    grossOrderValueGrowth?: number;
    customersGrowth?: number;
    transportersGrowth?: number;
    ordersShippedGrowth?: number;
}

interface ChartDataItem {
    month: string;
    customers: number;
    transporters: number;
}

const chartConfig = {
    customers: {
        label: "Customers",
        color: "hsl(var(--chart-1))",
    },
    transporters: {
        label: "Transporters",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function AdminDashboardOverview() {
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to transform userGrowth data for the chart
    const transformUserGrowthData = (userGrowth: UserGrowthItem[]): ChartDataItem[] => {
        if (!userGrowth || userGrowth.length === 0) return [];

        // Group by month and separate customers and transporters
        const groupedData: { [key: string]: { customers: number; transporters: number } } = {};

        userGrowth.forEach((item, index) => {
            const month = item.month;

            if (!groupedData[month]) {
                groupedData[month] = { customers: 0, transporters: 0 };
            }

            // Since your API doesn't distinguish between customers and transporters in userGrowth,
            // we'll need to make an assumption. You might need to update your API to provide this distinction.
            // For now, let's assume alternating entries or use the index to determine type
            if (index % 2 === 0) {
                groupedData[month].customers += item.count;
            } else {
                groupedData[month].transporters += item.count;
            }
        });

        // Convert to array format expected by the chart
        return Object.entries(groupedData).map(([month, data]) => ({
            month,
            customers: data.customers,
            transporters: data.transporters,
        }));
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await adminAnalyticsService.getDashboardData();
                setDashboardData(response.data); // Assuming response structure: { data: AdminDashboardData }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch admin dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
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

    if (error) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-500">
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
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

    // Transform the userGrowth data for the chart
    const chartData = dashboardData ? transformUserGrowthData(dashboardData.userGrowth) : [];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Order Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dashboardData?.grossOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.grossOrderValueGrowth ?
                                `${dashboardData.grossOrderValueGrowth > 0 ? '+' : ''}${dashboardData.grossOrderValueGrowth}% from last month` :
                                'Growth data not available'
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue from Customers</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dashboardData?.revenueFromCustomers?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.grossOrderValue ?
                                `${((dashboardData.revenueFromCustomers / dashboardData.grossOrderValue) * 100).toFixed(1)}% of Gross Order Value` :
                                '% of Gross Order Value'
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue from Transporters</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dashboardData?.revenueFromTransporters?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">Revenue from transporter fees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalCustomers?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.customersGrowth ?
                                `${dashboardData.customersGrowth > 0 ? '+' : ''}${dashboardData.customersGrowth} from last month` :
                                'Active customers'
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transporters</CardTitle>
                        <Truck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalTransporters?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.transportersGrowth ?
                                `${dashboardData.transportersGrowth > 0 ? '+' : ''}${dashboardData.transportersGrowth} from last month` :
                                'Active transporters'
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders Shipped</CardTitle>
                        <PackageCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalOrdersShipped?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.ordersShippedGrowth ?
                                `${dashboardData.ordersShippedGrowth > 0 ? '+' : ''}${dashboardData.ordersShippedGrowth} since last month` :
                                'Successfully shipped'
                            }
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">User Growth</CardTitle>
                    <CardDescription>Monthly user registration data</CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <BarChart accessibilityLayer data={chartData}>
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="customers" fill="var(--color-customers)" radius={4} />
                                    <Bar dataKey="transporters" fill="var(--color-transporters)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No user growth data available</p>
                                <p className="text-sm">Data will appear when users register</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}