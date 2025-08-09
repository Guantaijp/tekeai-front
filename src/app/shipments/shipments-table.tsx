"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Package, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {shipmentService} from "@/index";

interface Shipment {
    id: string
    trackingNumber: string
    itemDescription: string
    originAddress: string
    destinationAddress: string
    status: string
    platformFee: string
    pickupDate: string
    estimatedDeliveryDate: string
    customer: {
        user: {
            name: string
        }
    }
    transporter?: {
        user: {
            name: string
        }
    } | null
}

export default function ShipmentsTable() {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const fetchShipments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await shipmentService.getMyShipments()
            // Add safety check for the response structure
            const shipmentsData = response?.data?.data || response?.data || []

            // Filter shipments by status
            const filteredShipments = Array.isArray(shipmentsData)
                ? shipmentsData.filter((shipment: Shipment) =>
                    ["pickup_scheduled", "in_transit", "delivered"].includes(shipment.status),
                )
                : []

            setShipments(filteredShipments)
        } catch (err: any) {
            console.error("Failed to fetch shipments:", err)
            setError(err.response?.data?.message || "Failed to load your shipments.")
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to load your shipments.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchShipments()
    }, [fetchShipments])

    const handleTrackShipment = (shipmentId: string) => {
        // Navigate to the tracking page
        router.push(`/tracking/${shipmentId}`)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pickup_scheduled":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "in_transit":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "delivered":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatStatus = (status: string) => {
        return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading shipments...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchShipments}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Trackable Shipments</h1>
                        <p className="text-gray-600 mt-2">Track your requests and see delivery confirmations.</p>
                    </div>
                    <Button onClick={fetchShipments} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Active Shipments ({shipments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {shipments.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No trackable shipments found.</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Shipments with status: pickup_scheduled, in_transit, or delivered will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tracking Number</TableHead>
                                        <TableHead>Item Description</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Fee</TableHead>
                                        <TableHead>Pickup Date</TableHead>
                                        <TableHead>Est. Delivery</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.map((shipment) => (
                                        <TableRow key={shipment.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{shipment.trackingNumber}</TableCell>
                                            <TableCell>{shipment.itemDescription}</TableCell>
                                            <TableCell>{shipment.customer?.user?.name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate" title={`${shipment.originAddress} to ${shipment.destinationAddress}`}>
                                                    {shipment.originAddress} → {shipment.destinationAddress}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(shipment.status)}>
                                                    {formatStatus(shipment.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-600">${shipment.platformFee}</TableCell>
                                            <TableCell>{new Date(shipment.pickupDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {shipment.estimatedDeliveryDate
                                                    ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString()
                                                    : 'TBD'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleTrackShipment(shipment.id)}
                                                    className="flex items-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Track
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}