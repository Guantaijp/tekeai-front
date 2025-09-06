import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type OrderStatus = "Received" | "Approved" | "Rejected" | "Dispatch" | "Delivered" | "Cancelled" | "Sent"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "Received":
        return {
          variant: "secondary" as const,
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        }
      case "Approved":
        return { variant: "default" as const, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
      case "Rejected":
        return { variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
      case "Dispatch":
        return {
          variant: "secondary" as const,
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        }
      case "Delivered":
        return {
          variant: "default" as const,
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        }
      case "Cancelled":
        return { variant: "outline" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
      case "Sent":
        return {
          variant: "secondary" as const,
          color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        }
      default:
        return { variant: "outline" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
    }
  }

  const config = getStatusConfig(status)

  return (
      <Badge variant={config.variant} className={cn(config.color, className)}>
        {status}
      </Badge>
  )
}
