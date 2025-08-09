"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, CheckCircle, Clock, MapPin, User, Car, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import {shipmentService} from "@/index";

// Shipment service - replace with your actual service

interface Shipment {
    id: string
    trackingNumber: string
    itemDescription: string
    originAddress: string
    destinationAddress: string
    status: string
    platformFee: string
    pickupDate: string
    estimatedDeliveryDate: string | null
    specialInstructions: string | null
    customer: {
        user: {
            name: string
            phone: string
        }
    }
    transporter?: {
        user: {
            name: string
            phone: string
        }
    } | null
    vehicle?: {
        make: string
        model: string
        registrationNumber: string
        type: string
    } | null
}

export default function Page() {
    const { shipmentId } = useParams()
    const router = useRouter()
    console.log("shipment", shipmentId)
    const [shipment, setShipment] = useState<Shipment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchShipment = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await shipmentService.getShipmentById(shipmentId as string)
            // Handle different response structures
            const shipmentData = response?.data || response
            setShipment(shipmentData)
        } catch (err: any) {
            console.error("Failed to fetch shipment:", err)
            setError(err.message || "Failed to load shipment details.")
            toast({
                title: "Error",
                description: err.message || "Failed to load shipment details.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [shipmentId, toast])

    useEffect(() => {
        fetchShipment()
    }, [fetchShipment])

    const handleBack = () => {
        router.back() // Go back to previous page
        // Or use: router.push('/shipments') to go to a specific page
    }

    const getStatusIcon = (status: string, completed: boolean, current?: boolean) => {
        if (current) {
            return <Clock className="w-5 h-5 text-blue-600" />
        }
        if (completed) {
            return <CheckCircle className="w-5 h-5 text-green-600" />
        }
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pickup_scheduled":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "in_transit":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "delivered":
                return "bg-green-100 text-green-800 border-green-200"
            case "assigned":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "customer_accepted":
                return "bg-indigo-100 text-indigo-800 border-indigo-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatStatus = (status: string) => {
        return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }

    const getTimelineSteps = (status: string) => {
        const allSteps = [
            { status: "assigned", label: "Request Assigned", completed: false },
            { status: "customer_accepted", label: "Customer Accepted", completed: false },
            { status: "pickup_scheduled", label: "Pickup Scheduled", completed: false },
            { status: "in_transit", label: "In Transit", completed: false },
            { status: "delivered", label: "Delivered", completed: false },
        ]

        const statusOrder = ["assigned", "customer_accepted", "pickup_scheduled", "in_transit", "delivered"]
        const currentIndex = statusOrder.indexOf(status)

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }))
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading shipment details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !shipment) {
        return (
            <div className="container mx-auto p-6">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shipments
                </Button>
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchShipment}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const timelineSteps = getTimelineSteps(shipment.status)

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shipments
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cargo Tracking</h1>
                        <p className="text-gray-600">Tracking Number: {shipment.trackingNumber}</p>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(shipment.status)} text-sm px-3 py-1`}>
                        {formatStatus(shipment.status)}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Cargo Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center min-h-[200px]">
                            <Package className="w-20 h-20 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold">{shipment.itemDescription}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Customer:</span>
                                    <p className="font-medium">{shipment.customer?.user?.name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Platform Fee:</span>
                                    <p className="font-semibold text-green-600">${shipment.platformFee}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-gray-600">Route:</span>
                                    <p className="font-medium">{shipment.originAddress} → {shipment.destinationAddress}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Pickup Date:</span>
                                    <p className="font-medium">{new Date(shipment.pickupDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Est. Delivery:</span>
                                    <p className="font-medium">
                                        {shipment.estimatedDeliveryDate
                                            ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString()
                                            : 'To be determined'
                                        }
                                    </p>
                                </div>
                                {shipment.specialInstructions && (
                                    <div className="sm:col-span-2">
                                        <span className="text-gray-600">Special Instructions:</span>
                                        <p className="font-medium">{shipment.specialInstructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status and Details */}
                <div className="space-y-6">
                    {/* Shipment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {timelineSteps.map((step, index) => (
                                    <div key={step.status} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status, step.completed, step.current)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4
                                                    className={`font-medium ${
                                                        step.current ? "text-blue-600" : step.completed ? "text-green-600" : "text-gray-500"
                                                    }`}
                                                >
                                                    {step.label}
                                                </h4>
                                                {step.current && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {step.completed ? 'Completed' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transporter Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transporter Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shipment.transporter ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback>
                                                <User className="w-6 h-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-lg">{shipment.transporter.user.name}</h4>
                                            <p className="text-sm text-gray-600">{shipment.transporter.user.phone}</p>
                                        </div>
                                    </div>

                                    {shipment.vehicle && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h5 className="font-medium mb-3 flex items-center">
                                                    <Car className="w-4 h-4 mr-2" />
                                                    Vehicle Details
                                                </h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Make & Model:</span>
                                                        <p className="font-medium">{shipment.vehicle.make} {shipment.vehicle.model}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Type:</span>
                                                        <p className="font-medium capitalize">{shipment.vehicle.type}</p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <span className="text-gray-600">Registration:</span>
                                                        <p className="font-medium">{shipment.vehicle.registrationNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No transporter assigned yet</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        A transporter will be assigned once your shipment is accepted.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}