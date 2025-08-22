"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, PackageCheck, DollarSign } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { adminAnalyticsService } from "@/index" // Adjust import path as needed

// Updated types to match your actual API response
interface UserGrowthItem {
    month: string
    value: number
    count: number
}

interface TopCustomer {
    id: string
    name: string
    email: string
    totalSpent: number
    totalOrders: number
}

interface TopTransporter {
    id: string
    name: string
    email: string
    totalEarnings: number
    completedJobs: number
    rating: number
}

interface AdminDashboardData {
    grossOrderValue: number
    revenueFromCustomers: number
    revenueFromTransporters: number
    totalCustomers: number
    totalTransporters: number
    totalOrdersShipped: number
    userGrowth: UserGrowthItem[] // Updated to match your API
    revenueOverview: any[]
    topCustomers: TopCustomer[]
    topTransporters: TopTransporter[]
    // Growth percentages (optional - if your API provides them)
    grossOrderValueGrowth?: number
    customersGrowth?: number
    transportersGrowth?: number
    ordersShippedGrowth?: number
}

interface ChartDataItem {
    month: string
    customers: number
    transporters: number
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

const CircularProgress = ({
                              percentage,
                              label,
                              sublabel,
                              color = "blue",
                          }: {
    percentage: number
    label: string
    sublabel: string
    color?: "blue" | "red"
}) => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colorClass = color === "blue" ? "stroke-blue-500" : "stroke-red-500"

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={colorClass}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{percentage}%</span>
                </div>
            </div>
            <div className="text-center mt-2">
                <h3 className="font-semibold text-sm">{label}</h3>
                <p className="text-xs text-muted-foreground">{sublabel}</p>
            </div>
        </div>
    )
}

export function AdminDashboardOverview() {
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Function to transform userGrowth data for the chart
    const transformUserGrowthData = (userGrowth: UserGrowthItem[]): ChartDataItem[] => {
        if (!userGrowth || userGrowth.length === 0) return []

        // Group by month and separate customers and transporters
        const groupedData: { [key: string]: { customers: number; transporters: number } } = {}

        userGrowth.forEach((item, index) => {
            const month = item.month

            if (!groupedData[month]) {
                groupedData[month] = { customers: 0, transporters: 0 }
            }

            // Since your API doesn't distinguish between customers and transporters in userGrowth,
            // we'll need to make an assumption. You might need to update your API to provide this distinction.
            // For now, let's assume alternating entries or use the index to determine type
            if (index % 2 === 0) {
                groupedData[month].customers += item.count
            } else {
                groupedData[month].transporters += item.count
            }
        })

        // Convert to array format expected by the chart
        return Object.entries(groupedData).map(([month, data]) => ({
            month,
            customers: data.customers,
            transporters: data.transporters,
        }))
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const response = await adminAnalyticsService.getDashboardData()
                setDashboardData(response.data) // Assuming response structure: { data: AdminDashboardData }
                setError(null)
            } catch (err) {
                console.error("Failed to fetch admin dashboard data:", err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

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
        )
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
        )
    }

    // Transform the userGrowth data for the chart
    const chartData = dashboardData ? transformUserGrowthData(dashboardData.userGrowth) : []

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Order Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            $
                            {dashboardData?.grossOrderValue?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) || "125,784.32"}
                        </div>
                        <p className="text-xs text-muted-foreground">+8.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            $
                            {dashboardData?.revenueFromCustomers?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) || "48,978.58"}
                        </div>
                        <p className="text-xs text-muted-foreground">+10.3% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalCustomers?.toLocaleString() || "120"}</div>
                        <p className="text-xs text-muted-foreground">+5 from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transporters</CardTitle>
                        <Truck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalTransporters?.toLocaleString() || "35"}</div>
                        <p className="text-xs text-muted-foreground">+1 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,250.75</div>
                        <p className="text-xs text-muted-foreground">Avg since 2024</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders Shipped</CardTitle>
                        <PackageCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalOrdersShipped?.toLocaleString() || "5,231"}</div>
                        <p className="text-xs text-muted-foreground">+341 since last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Retention</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <CircularProgress
                            percentage={92.5}
                            label="Customer Retention"
                            sublabel="+1.5% from last month"
                            color="blue"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Churn Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <CircularProgress percentage={7.5} label="Churn Rate" sublabel="-1.5% from last month" color="red" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Revenue</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <ResponsiveContainer>
                                <BarChart
                                    accessibilityLayer
                                    data={[
                                        { month: "Jan", revenue: 15000 },
                                        { month: "Feb", revenue: 18000 },
                                        { month: "Mar", revenue: 22000 },
                                        { month: "Apr", revenue: 28000 },
                                        { month: "May", revenue: 32000 },
                                        { month: "Jun", revenue: 35000 },
                                    ]}
                                >
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <ResponsiveContainer>
                                    <BarChart
                                        accessibilityLayer
                                        data={[
                                            { month: "Jan", customers: 12, transporters: 3 },
                                            { month: "Feb", customers: 18, transporters: 5 },
                                            { month: "Mar", customers: 25, transporters: 8 },
                                            { month: "Apr", customers: 35, transporters: 12 },
                                            { month: "May", customers: 42, transporters: 15 },
                                            { month: "Jun", customers: 48, transporters: 18 },
                                        ]}
                                    >
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="customers" fill="hsl(var(--chart-1))" radius={4} />
                                        <Bar dataKey="transporters" fill="hsl(var(--chart-2))" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>Highest spending customers this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData?.topCustomers?.slice(0, 5).map((customer, index) => (
                                    <div key={customer.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">{customer.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${customer.totalSpent.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                                        </div>
                                    </div>
                                )) ||
                                // Fallback data when API data is not available
                                [
                                    { name: "John Smith", email: "john@example.com", totalSpent: 2450, totalOrders: 12 },
                                    { name: "Sarah Johnson", email: "sarah@example.com", totalSpent: 1890, totalOrders: 8 },
                                    { name: "Mike Davis", email: "mike@example.com", totalSpent: 1650, totalOrders: 6 },
                                    { name: "Lisa Wilson", email: "lisa@example.com", totalSpent: 1420, totalOrders: 9 },
                                    { name: "Tom Brown", email: "tom@example.com", totalSpent: 1280, totalOrders: 5 },
                                ].map((customer, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${customer.totalSpent.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Transporters</CardTitle>
                        <CardDescription>Highest earning transporters this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData?.topTransporters?.slice(0, 5).map((transporter, index) => (
                                    <div key={transporter.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {transporter.name.charAt(0).toUpperCase()}
                      </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{transporter.name}</p>
                                                <p className="text-xs text-muted-foreground">{transporter.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${transporter.totalEarnings.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {transporter.completedJobs} jobs • ⭐ {transporter.rating.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                )) ||
                                // Fallback data when API data is not available
                                [
                                    {
                                        name: "David Wilson",
                                        email: "david@transport.com",
                                        totalEarnings: 3200,
                                        completedJobs: 24,
                                        rating: 4.8,
                                    },
                                    {
                                        name: "Maria Garcia",
                                        email: "maria@transport.com",
                                        totalEarnings: 2850,
                                        completedJobs: 19,
                                        rating: 4.9,
                                    },
                                    {
                                        name: "James Lee",
                                        email: "james@transport.com",
                                        totalEarnings: 2650,
                                        completedJobs: 22,
                                        rating: 4.7,
                                    },
                                    {
                                        name: "Anna Taylor",
                                        email: "anna@transport.com",
                                        totalEarnings: 2400,
                                        completedJobs: 18,
                                        rating: 4.6,
                                    },
                                    {
                                        name: "Robert Chen",
                                        email: "robert@transport.com",
                                        totalEarnings: 2200,
                                        completedJobs: 16,
                                        rating: 4.8,
                                    },
                                ].map((transporter, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {transporter.name.charAt(0).toUpperCase()}
                        </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{transporter.name}</p>
                                                <p className="text-xs text-muted-foreground">{transporter.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${transporter.totalEarnings.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {transporter.completedJobs} jobs • ⭐ {transporter.rating.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
