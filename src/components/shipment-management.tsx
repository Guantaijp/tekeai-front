"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, Truck, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { shipmentService } from "@/index" // Import shipmentService
import { adminService } from "@/index"
import type { Shipment, ShipmentStatus } from "@/types/api" // Import Shipment and ShipmentStatus types

export function ShipmentManagement() {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchShipments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            // Assuming getAllShipments fetches all shipments for an admin view
            const response = await adminService.getAllShipments()
            setShipments(response.data.data.shipments)
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch shipments.")
            console.error("Error fetching shipments:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchShipments()
    }, [fetchShipments])

    const getStatusVariant = (
        status: string,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status.toLowerCase()) {
            case "pending":
            case "assigned":
                return "secondary"
            case "approved":
            case "customer_accepted":
                return "default"
            case "in-transit":
                return "default"
            case "delivered":
                return "outline"
            case "cancelled":
            case "rejected":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const handleViewShipment = (shipment: Shipment) => {
        setSelectedShipment(shipment)
        setViewDialogOpen(true)
    }

    const handleCancelShipment = async (shipmentId: string) => {
        if (!confirm("Are you sure you want to cancel this shipment?")) return
        try {
            await shipmentService.cancelShipment(shipmentId) // Call the service function
            fetchShipments() // Re-fetch shipments to update the table
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to cancel shipment ${shipmentId}.`)
            console.error("Error canceling shipment:", err)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Shipment Management</CardTitle>
                    <CardDescription>Loading shipments...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10">Loading shipments...</div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Shipment Management</CardTitle>
                    <CardDescription>Error loading shipments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-red-500">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle className="font-headline">Shipment Management</CardTitle>
                        <CardDescription>View and manage all shipments on the platform.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking Number</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Transporter</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Weight (kg)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shipments.length > 0 ? (
                                shipments.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={shipment.itemDescription}>
                                            {shipment.itemDescription}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {shipment.customer?.name || shipment.customer?.user?.name || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {shipment.transporter?.user?.name || "Not Assigned"}
                                        </TableCell>
                                        <TableCell className="max-w-[250px]">
                                            <div className="text-sm">
                                                <div className="truncate" title={shipment.originAddress}>
                                                    From: {shipment.originAddress}
                                                </div>
                                                <div className="truncate text-muted-foreground" title={shipment.destinationAddress}>
                                                    To: {shipment.destinationAddress}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{shipment.weight}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(shipment.status)}>
                                                {shipment.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewShipment(shipment)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {/*<DropdownMenuItem onClick={() => console.log(`Track shipment ${shipment.trackingNumber}`)}>*/}
                                                    {/*    <Truck className="mr-2 h-4 w-4" />*/}
                                                    {/*    Track Shipment*/}
                                                    {/*</DropdownMenuItem>*/}
                                                    {/*{shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (*/}
                                                    {/*    <DropdownMenuItem*/}
                                                    {/*        className="text-destructive"*/}
                                                    {/*        onClick={() => handleCancelShipment(shipment.id)}*/}
                                                    {/*    >*/}
                                                    {/*        <X className="mr-2 h-4 w-4" />*/}
                                                    {/*        Cancel Shipment*/}
                                                    {/*    </DropdownMenuItem>*/}
                                                    {/*)}*/}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No shipments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{shipments.length}</strong> shipments
                    </div>
                </CardFooter>
            </Card>

            {/* View Shipment Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Shipment Details</DialogTitle>
                        <DialogDescription>
                            Complete information for tracking number: {selectedShipment?.trackingNumber}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShipment && (
                        <div className="grid gap-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                                            <p className="font-mono">{selectedShipment.trackingNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <div className="mt-1">
                                                <Badge variant={getStatusVariant(selectedShipment.status)}>
                                                    {selectedShipment.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Weight</label>
                                            <p>{selectedShipment.weight} kg</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Distance</label>
                                            <p>{selectedShipment.distanceKm} km</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Item Description</label>
                                            <p className="break-words">{selectedShipment.itemDescription}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Dates & Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                            <p>{formatDate(selectedShipment.createdAt)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Pickup Date</label>
                                            <p>{formatDate(selectedShipment.pickupDate)}</p>
                                        </div>
                                        {selectedShipment.deliveryDate && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                                                <p>{formatDate(selectedShipment.deliveryDate)}</p>
                                            </div>
                                        )}
                                        {selectedShipment.estimatedDeliveryDate && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Estimated Delivery</label>
                                                <p>{formatDate(selectedShipment.estimatedDeliveryDate)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                            <p>{formatDate(selectedShipment.updatedAt)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Address Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Route Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Origin Address</label>
                                        <p className="break-words">{selectedShipment.originAddress}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Destination Address</label>
                                        <p className="break-words">{selectedShipment.destinationAddress}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            {selectedShipment.customer && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Customer Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                                            <p>{selectedShipment.customer.name || selectedShipment.customer.user?.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p>{selectedShipment.customer.email || selectedShipment.customer.user?.email}</p>
                                        </div>
                                        {(selectedShipment.customer.phone || selectedShipment.customer.user?.phone) && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                                <p>{selectedShipment.customer.phone || selectedShipment.customer.user?.phone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Total Shipments</label>
                                            <p>{selectedShipment.customer.totalShipments}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                                            <p>KES {selectedShipment.customer.totalSpent}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transporter Information */}
                            {selectedShipment.transporter && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Transporter Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                            <p>{selectedShipment.transporter.user.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p>{selectedShipment.transporter.user.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p>{selectedShipment.transporter.user.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Rating</label>
                                            <p>{selectedShipment.transporter.rating}/5.0</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <Badge variant="outline">{selectedShipment.transporter.status}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Vehicle Information */}
                            {selectedShipment.vehicle && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Vehicle Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                                            <p className="font-mono">{selectedShipment.vehicle.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Model</label>
                                            <p>{selectedShipment.vehicle.model}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                                            <Badge variant="outline">{selectedShipment.vehicle.type}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}