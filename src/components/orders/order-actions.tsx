"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, MoreHorizontal, Eye, Edit, Truck } from "lucide-react"
import type { Order } from "./order-table"
import type { OrderStatus } from "./order-status-badge"

interface OrderActionsProps {
  order: Order
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void
  onViewDetails?: (orderId: string) => void
}

export function OrderActions({ order, onStatusChange, onViewDetails }: OrderActionsProps) {
  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange?.(order.id, newStatus)
  }

  const handleViewDetails = () => {
    onViewDetails?.(order.id)
  }

  // Primary action based on status
  const getPrimaryAction = () => {
    switch (order.status) {
      case "Received":
        return (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 bg-transparent"
            onClick={() => handleStatusChange("Approved")}
          >
            <ChevronDown className="h-3 w-3" />
            Approve
          </Button>
        )
      case "Approved":
        return (
          <Button size="sm" onClick={() => handleStatusChange("Dispatch")}>
            Mark for Dispatch
          </Button>
        )
      case "Dispatch":
        return (
          <Button size="sm" className="gap-1">
            <Truck className="h-3 w-3" />
            Arrange Transport
          </Button>
        )
      default:
        return null
    }
  }

  const primaryAction = getPrimaryAction()

  return (
    <div className="flex items-center gap-2">
      {primaryAction}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </DropdownMenuItem>
          {order.status === "Received" && (
            <DropdownMenuItem onClick={() => handleStatusChange("Approved")}>Approve Order</DropdownMenuItem>
          )}
          {order.status === "Approved" && (
            <DropdownMenuItem onClick={() => handleStatusChange("Dispatch")}>Mark for Dispatch</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
