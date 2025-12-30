'use client';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Calendar, Wallet } from 'lucide-react';

// Sample data - replace with actual data from your backend
const payouts = [
    {
        id: 'PAY-001',
        date: '2024-12-28',
        customer: 'Acme Corp',
        orderId: 'ORD-1234',
        amount: 15750.00,
        status: 'completed',
        method: 'Bank Transfer',
    },
    {
        id: 'PAY-002',
        date: '2024-12-25',
        customer: 'TechStart Ltd',
        orderId: 'ORD-1235',
        amount: 8400.00,
        status: 'completed',
        method: 'M-Pesa',
    },
    {
        id: 'PAY-003',
        date: '2024-12-22',
        customer: 'Global Logistics',
        orderId: 'ORD-1236',
        amount: 23100.00,
        status: 'completed',
        method: 'Bank Transfer',
    },
    {
        id: 'PAY-004',
        date: '2024-12-20',
        customer: 'Metro Supplies',
        orderId: 'ORD-1237',
        amount: 12650.00,
        status: 'pending',
        method: 'Bank Transfer',
    },
    {
        id: 'PAY-005',
        date: '2024-12-18',
        customer: 'QuickShip Inc',
        orderId: 'ORD-1238',
        amount: 19800.00,
        status: 'completed',
        method: 'M-Pesa',
    },
    {
        id: 'PAY-006',
        date: '2024-12-15',
        customer: 'Urban Traders',
        orderId: 'ORD-1239',
        amount: 7350.00,
        status: 'completed',
        method: 'Bank Transfer',
    },
];

export function PayoutsPage() {
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredPayouts = payouts.filter(payout =>
        filterStatus === 'all' ? true : payout.status === filterStatus
    );

    const totalEarnings = payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
                <p className="text-muted-foreground mt-2">
                    View and manage your payment history
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Completed payouts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting processing
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalEarnings * 0.6)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            December earnings
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>
                                All your completed and pending payouts
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payout ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayouts.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell className="font-medium">{payout.id}</TableCell>
                                    <TableCell>{formatDate(payout.date)}</TableCell>
                                    <TableCell>{payout.customer}</TableCell>
                                    <TableCell>{payout.orderId}</TableCell>
                                    <TableCell>{payout.method}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                payout.status === 'completed' ? 'default' : 'secondary'
                                            }
                                        >
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(payout.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}