"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { shipmentService } from "@/index" // Import shipmentService
import type { Shipment, ShipmentStatus } from "@/types/api" // Import Shipment and ShipmentStatus types

export function ShipmentManagement() {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchShipments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            // Assuming getAllShipments fetches all shipments for an admin view
            const response = await shipmentService.getAllShipments()
            setShipments(response.data.data)
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
        status: ShipmentStatus,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status) {
            case "pending":
                return "secondary"
            case "approved":
                return "default"
            case "in-transit":
                return "default"
            case "delivered":
                return "outline"
            case "cancelled":
                return "destructive"
            default:
                return "secondary"
        }
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Shipment Management</CardTitle>
                    <CardDescription>View and manage all shipments on the platform.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Shipment
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shipment ID</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Transporter</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Date</TableHead>
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
                                    <TableCell className="font-mono">{shipment.id}</TableCell>
                                    <TableCell className="font-medium">{shipment.itemDescription}</TableCell>
                                    {/* Assuming customer and transporter names are available in the Shipment object or can be fetched */}
                                    <TableCell>{"N/A"}</TableCell> {/* Placeholder for Customer Name */}
                                    <TableCell>{"N/A"}</TableCell> {/* Placeholder for Transporter Name */}
                                    <TableCell>{`${shipment.originAddress} to ${shipment.destinationAddress}`}</TableCell>
                                    <TableCell>{new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>
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
                                                <DropdownMenuItem onClick={() => console.log(`View details for ${shipment.id}`)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => console.log(`Track shipment ${shipment.id}`)}>
                                                    Track Shipment
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleCancelShipment(shipment.id)}
                                                >
                                                    Cancel Shipment
                                                </DropdownMenuItem>
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
    )
}
