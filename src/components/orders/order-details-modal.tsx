"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Package,
    Calendar,
    MapPin,
    User,
    Building,
    FileText,
    DollarSign,
    Hash,
    CheckCircle,
    Clock,
    Truck,
    Mail,
    XCircle,
    Phone,
    Download,
    Eye
} from "lucide-react"
import type { OrderStatus } from "@/components/orders/order-status-badge"

// Extended Order interface to match your dashboard
interface ExtendedOrder {
    id: string
    dbId: number
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

interface OrderDetailsModalProps {
    order: ExtendedOrder | null
    isOpen: boolean
    onClose: () => void
}

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case "Received":
            return <Package className="h-4 w-4" />
        case "Approved":
            return <CheckCircle className="h-4 w-4" />
        case "Dispatch":
            return <Truck className="h-4 w-4" />
        case "Sent":
            return <Mail className="h-4 w-4" />
        case "Delivered":
            return <CheckCircle className="h-4 w-4" />
        case "Cancelled":
            return <XCircle className="h-4 w-4" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case "Received":
            return "bg-blue-50 text-blue-700 border-blue-200"
        case "Approved":
            return "bg-green-50 text-green-700 border-green-200"
        case "Dispatch":
            return "bg-orange-50 text-orange-700 border-orange-200"
        case "Sent":
            return "bg-purple-50 text-purple-700 border-purple-200"
        case "Delivered":
            return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "Cancelled":
            return "bg-red-50 text-red-700 border-red-200"
        default:
            return "bg-gray-50 text-gray-700 border-gray-200"
    }
}

const getStatusBgColor = (status: OrderStatus) => {
    switch (status) {
        case "Received":
            return "bg-blue-500"
        case "Approved":
            return "bg-green-500"
        case "Dispatch":
            return "bg-orange-500"
        case "Sent":
            return "bg-purple-500"
        case "Delivered":
            return "bg-emerald-500"
        case "Cancelled":
            return "bg-red-500"
        default:
            return "bg-gray-500"
    }
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
    if (!order) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount)
    }

    const handlePrintOrder = () => {
        const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 5px;">Order Details</h1>
          <h2 style="color: #666; font-weight: normal;">Order #${order.id}</h2>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Information</h3>
            <p><strong>Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Type:</strong> ${order.type} Order</p>
            <p><strong>Quantity:</strong> ${order.quantity} items</p>
            <p><strong>LPO:</strong> ${order.lpo ? 'Available' : 'Not Available'}</p>
          </div>
          
          <div>
            <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Financial Details</h3>
            <p><strong>Total Amount:</strong> ${formatCurrency(order.amount)}</p>
            <p><strong>Per Item Average:</strong> ${formatCurrency(order.amount / order.quantity)}</p>
          </div>
        </div>
        
        ${order.buyer || order.supplier ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Contact Information</h3>
          ${order.buyer ? `<p><strong>Buyer:</strong> ${order.buyer}</p>` : ''}
          ${order.supplier ? `<p><strong>Supplier:</strong> ${order.supplier}</p>` : ''}
        </div>
        ` : ''}
        
        ${order.location || order.destination ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Location Details</h3>
          ${order.location ? `<p><strong>Location:</strong> ${order.location}</p>` : ''}
          ${order.destination ? `<p><strong>Destination:</strong> ${order.destination}</p>` : ''}
        </div>
        ` : ''}
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Items</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${order.items}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Printed on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()
            printWindow.print()
            printWindow.close()
        }
    }

    const handleExportOrder = () => {
        const exportData = {
            orderId: order.id,
            dbId: order.dbId,
            date: order.date,
            status: order.status,
            type: order.type,
            quantity: order.quantity,
            amount: order.amount,
            buyer: order.buyer,
            supplier: order.supplier,
            location: order.location,
            destination: order.destination,
            lpo: order.lpo,
            items: order.items,
            exportedAt: new Date().toISOString()
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `order-${order.id}-details.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className={`p-2 rounded-lg ${getStatusBgColor(order.status)} text-white`}>
                            <Package className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span>Order Details</span>
                            <span className="text-sm font-normal text-muted-foreground">#{order.id}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Basic Info Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-1`}>
                                {getStatusIcon(order.status)}
                                <span className="font-medium">{order.status}</span>
                            </Badge>
                            <Badge variant="outline" className="capitalize px-3 py-1">
                                {order.type} Order
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.date)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(order.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {order.quantity} items • {formatCurrency(order.amount / order.quantity)} per item
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Order Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-primary" />
                                        Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                                            <p className="font-mono text-sm">{order.id}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm font-medium text-muted-foreground">Database ID</span>
                                            <p className="font-mono text-sm">{order.dbId}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-t">
                                        <span className="text-sm font-medium">Total Quantity</span>
                                        <Badge variant="secondary">{order.quantity} items</Badge>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-t">
                                        <span className="text-sm font-medium">LPO Document</span>
                                        <Badge variant={order.lpo ? "default" : "secondary"} className="text-xs">
                                            {order.lpo ? (
                                                <>
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    Available
                                                </>
                                            ) : (
                                                "Not Available"
                                            )}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.buyer && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <User className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-sm">Buyer</p>
                                                <p className="text-sm text-muted-foreground">{order.buyer}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.supplier && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Building className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="font-medium text-sm">Supplier</p>
                                                <p className="text-sm text-muted-foreground">{order.supplier}</p>
                                            </div>
                                        </div>
                                    )}
                                    {!order.buyer && !order.supplier && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No contact information available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Location Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Location Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.location && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-orange-500" />
                                            <div>
                                                <p className="font-medium text-sm">Current Location</p>
                                                <p className="text-sm text-muted-foreground">{order.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.destination && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="font-medium text-sm">Destination</p>
                                                <p className="text-sm text-muted-foreground">{order.destination}</p>
                                            </div>
                                        </div>
                                    )}
                                    {!order.location && !order.destination && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No location information available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Financial Breakdown */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        Financial Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                            <span className="font-medium text-green-800">Total Amount</span>
                                            <span className="text-lg font-bold text-green-800">
                        {formatCurrency(order.amount)}
                      </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                                <p className="font-medium">Per Item</p>
                                                <p className="text-muted-foreground">
                                                    {formatCurrency(order.amount / order.quantity)}
                                                </p>
                                            </div>
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                                <p className="font-medium">Total Items</p>
                                                <p className="text-muted-foreground">{order.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Items Details - Full Width */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                                <p className="text-sm leading-relaxed whitespace-pre-line">
                                    {order.items}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Status - Full Width */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Current Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <div className={`p-3 rounded-full ${getStatusBgColor(order.status)} text-white`}>
                                    {getStatusIcon(order.status)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-base">{order.status}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Last updated on {formatDate(order.date)}
                                    </p>
                                </div>
                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                        <button
                            onClick={handleExportOrder}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export JSON
                        </button>
                        <button
                            onClick={handlePrintOrder}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                            Print Details
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-6 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}