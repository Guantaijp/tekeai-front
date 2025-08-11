"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Truck, DollarSign, Star, CheckCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { transporterAnalyticsService } from "@/index"; // Adjust import path as needed

// Updated types to match your actual API response
interface ApiJobData {
    id: string;
    trackingNumber: string;
    customerName: string;
    originAddress: string;
    destinationAddress: string;
    status: string;
    createdAt: string;
    payout: number;
}

interface ApiPerformanceData {
    month: string;
    value: number;
    count: number;
}

interface ApiDashboardResponse {
    totalPayout: number;
    activeJobs: number;
    completedJobs: number;
    averageRating: number;
    performanceOverview: ApiPerformanceData[];
    totalEarningsThisMonth: number;
    completionRate: number;
    recentJobs: ApiJobData[];
}

// Transformed types for the component
interface TransformedJob {
    id: string;
    item: string;
    route: string;
    status: string;
    payout: number;
}

interface TransformedPerformance {
    month: string;
    earnings: number;
    jobsDone: number;
}

interface TransformedDashboardData {
    totalPayout: number;
    activeJobs: number;
    completedJobs: number;
    averageRating: number;
    totalReviews: number;
    monthlyPerformance: TransformedPerformance[];
    recentJobs: TransformedJob[];
    growthMetrics: {
        completedJobsGrowth: string;
        newJobsToday: number;
    };
}

const chartConfig = {
    earnings: {
        label: "Earnings",
        color: "hsl(var(--chart-1))",
    },
    jobsDone: {
        label: "Jobs Done",
        color: "hsl(var(--chart-2))",
    }
} satisfies ChartConfig

const getStatusVariant = (status: string): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
    switch (status.toLowerCase()) {
        case 'in progress':
        case 'in_progress':
        case 'active':
            return 'default';
        case 'completed':
        case 'delivered':
            return 'outline';
        case 'pending':
            return 'secondary';
        case 'cancelled':
        case 'rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
};

// Function to transform API data to component format
const transformDashboardData = (apiData: ApiDashboardResponse): TransformedDashboardData => {
    // Transform recent jobs
    console.log(transformDashboardData)
    const transformedJobs: TransformedJob[] = apiData.recentJobs.map(job => ({
        id: job.trackingNumber || job.id,
        item: job.customerName || 'Package', // Using customer name as item since item field is not in API
        route: `${job.originAddress} → ${job.destinationAddress}`,
        status: job.status.charAt(0).toUpperCase() + job.status.slice(1), // Capitalize first letter
        payout: job.payout
    }));

    // Transform performance data
    const transformedPerformance: TransformedPerformance[] = apiData.performanceOverview.map(perf => ({
        month: perf.month,
        earnings: perf.value, // Assuming 'value' represents earnings
        jobsDone: perf.count
    }));

    // Calculate growth metrics (mock calculations since not provided by API)
    const completedJobsGrowth = apiData.completionRate ? `${apiData.completionRate}%` : "0%";
    const newJobsToday = apiData.recentJobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        const today = new Date();
        return jobDate.toDateString() === today.toDateString();
    }).length;

    return {
        totalPayout: apiData.totalPayout,
        activeJobs: apiData.activeJobs,
        completedJobs: apiData.completedJobs,
        averageRating: apiData.averageRating,
        totalReviews: apiData.completedJobs, // Using completed jobs as review count since not provided
        monthlyPerformance: transformedPerformance,
        recentJobs: transformedJobs,
        growthMetrics: {
            completedJobsGrowth,
            newJobsToday
        }
    };
};

export function TransporterDashboardOverview() {
    const [dashboardData, setDashboardData] = useState<TransformedDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await transporterAnalyticsService.getDashboardData();

                // Check if response and response.data exist
                if (response && response.data) {
                    // Transform the API data to match expected format
                    const transformedData = transformDashboardData(response.data);
                    setDashboardData(transformedData);
                } else {
                    setError('No data received from server');
                }
            } catch (err) {
                setError('Error loading dashboard data');
                console.error('Dashboard data fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>No dashboard data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KSh {dashboardData.totalPayout.toLocaleString('en-KE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                        </div>
                        {/*<p className="text-xs text-muted-foreground">After 5% platform fee</p>*/}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData.growthMetrics.newJobsToday} picked up today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.completedJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData.growthMetrics.completedJobsGrowth} completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Based on {dashboardData.totalReviews} jobs
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Performance Overview</CardTitle>
                        <CardDescription>Monthly earnings and jobs completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dashboardData.monthlyPerformance.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <BarChart accessibilityLayer data={dashboardData.monthlyPerformance}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <YAxis
                                            dataKey="earnings"
                                            yAxisId="left"
                                            tickFormatter={(value) => `KSh ${Number(value) >= 1000 ? (Number(value)/1000).toFixed(1) + 'k' : value}`}
                                            name="Earnings"
                                        />
                                        <YAxis
                                            dataKey="jobsDone"
                                            yAxisId="right"
                                            orientation="right"
                                            tickFormatter={(value) => `${value}`}
                                            name="Jobs Done"
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent
                                                formatter={(value, name) => {
                                                    if (name === "earnings") {
                                                        return `KSh ${Number(value).toLocaleString('en-KE', {
                                                            maximumFractionDigits: 0
                                                        })}`
                                                    }
                                                    return value
                                                }}
                                            />}
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            dataKey="earnings"
                                            fill="var(--color-earnings)"
                                            radius={[4, 4, 0, 0]}
                                            yAxisId="left"
                                        />
                                        <Bar
                                            dataKey="jobsDone"
                                            fill="var(--color-jobsDone)"
                                            radius={[4, 4, 0, 0]}
                                            yAxisId="right"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No performance data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Jobs</CardTitle>
                        <CardDescription>Your most recent job activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dashboardData.recentJobs.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tracking Number</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Payout</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dashboardData.recentJobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-mono text-sm">{job.id}</TableCell>
                                            <TableCell className="font-medium">{job.item}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={job.route}>
                                                {job.route}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                KSh {job.payout.toLocaleString('en-KE')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                No recent jobs available
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/transporter-dashboard?view=my-jobs">
                                View All Jobs
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}