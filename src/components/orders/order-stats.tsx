import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Clock, CheckCircle, Truck, DollarSign } from "lucide-react"
import type { Order } from "./order-table"

interface OrderStatsProps {
  orders: Order[]
  stats?: any
}

export function OrderStats({ orders, stats }: OrderStatsProps) {
  // Calculate stats from orders if not provided by API
  const calculateStats = () => {
    if (stats) return stats

    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === "Received").length
    const approvedOrders = orders.filter((o) => o.status === "Approved").length
    const dispatchedOrders = orders.filter((o) => o.status === "Dispatch").length
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      dispatchedOrders,
      deliveredOrders,
      totalRevenue,
      averageOrderValue,
    }
  }

  const calculatedStats = calculateStats()

  const statCards = [
    {
      title: "Total Orders",
      value: calculatedStats.totalOrders,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: calculatedStats.pendingOrders,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Approved",
      value: calculatedStats.approvedOrders,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "In Transit",
      value: calculatedStats.dispatchedOrders,
      icon: Truck,
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `$${calculatedStats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ]

  return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/*{statCards.map((stat, index) => {*/}
        {/*  const Icon = stat.icon*/}
        {/*  return (*/}
        {/*      <Card key={index}>*/}
        {/*        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
        {/*          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>*/}
        {/*          <Icon className={`h-4 w-4 ${stat.color}`} />*/}
        {/*        </CardHeader>*/}
        {/*        <CardContent>*/}
        {/*          <div className="text-2xl font-bold">{stat.value}</div>*/}
        {/*        </CardContent>*/}
        {/*      </Card>*/}
        {/*  )*/}
        {/*})}*/}
      </div>
  )
}
