"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, FileText } from "lucide-react"
import { OrderStatusBadge, type OrderStatus } from "./order-status-badge"

export interface Order {
  id: string
  date: string
  items: string
  quantity: number
  buyer?: string
  supplier?: string
  location?: string
  destination?: string
  lpo: boolean
  amount: number
  status: OrderStatus
  type: "received" | "sent"
}

interface OrderTableProps {
  orders: Order[]
  type: "received" | "sent"
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
  onViewDetails: (orderId: string) => void
  loading?: boolean
}

export function OrderTable({ orders, type, onStatusChange, onViewDetails, loading = false }: OrderTableProps) {
  const getStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
    if (type === "received") {
      switch (currentStatus) {
        case "Received":
          return ["Approved", "Cancelled"]
        case "Approved":
          return ["Dispatch", "Cancelled"]
        case "Dispatch":
          return ["Delivered", "Cancelled"]
        default:
          return []
      }
    } else {
      // For sent orders, status changes are typically handled by the supplier
      return []
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
  }

  if (orders.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No orders found.</div>
  }

  return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>

              {type === "received" && <TableHead>Buyer</TableHead>}
              {type === "received" && <TableHead>Location</TableHead>}

              {/*/!* Show only when type === "sent" AND NOT "insend" *!/*/}
              {/*{type === "sent" && type !== "insend" && <TableHead>Destination</TableHead>}*/}
              {/*{type === "sent" && type !== "insend" && <TableHead>Supplier</TableHead>}*/}

              <TableHead>LPO</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  {/*<TableCell className="max-w-[200px] truncate" title={order.items}>*/}
                  {/*  {order.items}*/}
                  {/*</TableCell>*/}
                  {/*<TableCell>{order.quantity}</TableCell>*/}
                  {type === "received" && <TableCell>{order.buyer}</TableCell>}
                  {/*{type === "sent" && <TableCell>{order.supplier}</TableCell>}*/}
                  {type === "received" && <TableCell>{order.location}</TableCell>}
                  {/*{type === "sent" && <TableCell>{order.destination}</TableCell>}*/}
                  <TableCell>
                    {order.lpo ? (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Yes
                        </Badge>
                    ) : (
                        <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>${order.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {getStatusOptions(order.status).map((status) => (
                            <DropdownMenuItem key={status} onClick={() => onStatusChange(order.id, status)}>
                              Mark as {status}
                            </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  )
}
