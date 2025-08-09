"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { shipmentService } from "@/index"
import { type Shipment, ShipmentStatus, QuoteStatus } from "@/types/api"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Package, MapPin, Calendar, User, Truck, DollarSign, Phone, Mail, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function MyShipmentsPage() {
    const { toast } = useToast()
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showAcceptDialog, setShowAcceptDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [shipmentToCancel, setShipmentToCancel] = useState<Shipment | null>(null)
    const [shipmentToAccept, setShipmentToAccept] = useState<Shipment | null>(null)
    const [shipmentToReject, setShipmentToReject] = useState<Shipment | null>(null)
    const [isProcessingAction, setIsProcessingAction] = useState(false)

    const fetchShipments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await shipmentService.getMyShipments()
            // Add safety check for the response structure
            const shipmentsData = response?.data?.data || response?.data || []
            setShipments(Array.isArray(shipmentsData) ? shipmentsData : [])
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

    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return "N/A"
        }
    }

    const formatCurrency = (amount: number | string | undefined | null) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount
        return num ? `KSh ${num.toFixed(2)}` : "KSh 0.00"
    }

    useEffect(() => {
        fetchShipments()
    }, [fetchShipments])

    // Accept/Reject Shipment Functions
    const handleAcceptShipmentClick = (shipment: Shipment) => {
        setShipmentToAccept(shipment)
        setShowAcceptDialog(true)
    }

    const confirmAcceptShipment = async () => {
        if (!shipmentToAccept) return
        setIsProcessingAction(true)
        try {
            await shipmentService.updateShipmentStatus(shipmentToAccept.id, {
                status: ShipmentStatus.PENDING
            })
            toast({
                title: "Shipment Accepted!",
                description: `Shipment ${shipmentToAccept.trackingNumber} has been accepted and is now available for transporters to quote on.`,
            })
            fetchShipments()
            setShowAcceptDialog(false)
            setShipmentToAccept(null)
        } catch (err: any) {
            console.error("Failed to accept shipment:", err)
            toast({
                title: "Accept Failed",
                description: err.response?.data?.message || "There was an error accepting the shipment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleRejectShipmentClick = (shipment: Shipment) => {
        setShipmentToReject(shipment)
        setShowRejectDialog(true)
    }

    const confirmRejectShipment = async () => {
        if (!shipmentToReject) return
        setIsProcessingAction(true)
        try {
            await shipmentService.updateShipmentStatus(shipmentToReject.id, {
                status: ShipmentStatus.CANCELLED
            })
            toast({
                title: "Shipment Rejected!",
                description: `Shipment ${shipmentToReject.trackingNumber} has been rejected and will not be visible to transporters.`,
            })
            fetchShipments()
            setShowRejectDialog(false)
            setShipmentToReject(null)
        } catch (err: any) {
            console.error("Failed to reject shipment:", err)
            toast({
                title: "Rejection Failed",
                description: err.response?.data?.message || "There was an error rejecting the shipment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleApproveQuote = async (shipmentId: string, quoteId: string) => {
        if (!confirm("Are you sure you want to approve this quote?")) return
        setIsProcessingAction(true)
        try {
            await shipmentService.approveQuote(shipmentId, quoteId, {})
            toast({
                title: "Quote Approved!",
                description: "The selected quote has been approved. Your shipment is being prepared.",
            })
            fetchShipments()
        } catch (err: any) {
            console.error("Failed to approve quote:", err)
            toast({
                title: "Approval Failed",
                description: err.response?.data?.message || "There was an error approving the quote. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleRejectQuote = async (shipmentId: string, quoteId: string) => {
        if (!confirm("Are you sure you want to reject this quote?")) return
        setIsProcessingAction(true)
        try {
            await shipmentService.rejectQuote(shipmentId, quoteId)
            toast({
                title: "Quote Rejected!",
                description: "The selected quote has been rejected.",
            })
            fetchShipments()
        } catch (err: any) {
            console.error("Failed to reject quote:", err)
            toast({
                title: "Rejection Failed",
                description: err.response?.data?.message || "There was an error rejecting the quote. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleCancelShipmentClick = (shipment: Shipment) => {
        setShipmentToCancel(shipment)
        setShowCancelDialog(true)
    }

    const confirmCancelShipment = async () => {
        if (!shipmentToCancel) return
        setIsProcessingAction(true)
        try {
            await shipmentService.updateShipmentStatus(shipmentToCancel.id, { status: ShipmentStatus.CANCELLED })
            toast({
                title: "Shipment Cancelled!",
                description: `Shipment ${shipmentToCancel.trackingNumber} has been cancelled.`,
            })
            fetchShipments()
            setShowCancelDialog(false)
            setShipmentToCancel(null)
        } catch (err: any) {
            console.error("Failed to cancel shipment:", err)
            toast({
                title: "Cancellation Failed",
                description: err.response?.data?.message || "There was an error cancelling the shipment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const getShipmentStatusVariant = (
        status: ShipmentStatus,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status) {
            case ShipmentStatus.PENDING:
                return "secondary"
            case ShipmentStatus.QUOTE_GENERATED:
                return "default"
            case ShipmentStatus.QUOTE_APPROVED:
                return "default"
            case ShipmentStatus.PICKUP_SCHEDULED:
                return "default"
            case ShipmentStatus.IN_TRANSIT:
                return "default"
            case ShipmentStatus.DELIVERED:
                return "outline"
            case ShipmentStatus.CANCELLED:
                return "destructive"
            default:
                return "secondary"
        }
    }

    const getQuoteStatusVariant = (
        status: QuoteStatus,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status) {
            case QuoteStatus.PENDING:
                return "secondary"
            case QuoteStatus.APPROVED:
                return "default"
            case QuoteStatus.REJECTED:
                return "destructive"
            default:
                return "secondary"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'assigned':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'cancelled':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Package className="h-4 w-4 text-blue-500" />
        }
    }

    const isShipmentPendingAcceptance = (shipment: Shipment) => {
        return shipment.status === "DRAFT" || shipment.status === "AWAITING_ACCEPTANCE"
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="w-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-3 mb-8">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchShipments} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                            <Package className="h-4 w-4 mr-2" />
                            Retry Loading Shipments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
                </div>
                <Badge variant="outline" className="text-sm">
                    {Array.isArray(shipments) ? shipments.length : 0} shipments
                </Badge>
            </div>

            {!Array.isArray(shipments) || shipments.length === 0 ? (
                <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Shipments Found</h3>
                        <p className="text-gray-500">You haven't made any shipment requests yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {shipments.map((shipment) => (
                        <Card key={shipment.id} className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            {getStatusIcon(shipment.status)}
                                            <span className="font-mono text-lg">{shipment.trackingNumber}</span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-2 text-base">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{shipment.originAddress}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="font-medium">{shipment.destinationAddress}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={getShipmentStatusVariant(shipment.status)}
                                        className="capitalize text-sm px-3 py-1"
                                    >
                                        {shipment.status.replace(/_/g, " ")}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Shipment Details Grid */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Package className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Item & Weight</p>
                                            <p className="font-semibold">{shipment.itemDescription}</p>
                                            <p className="text-sm text-gray-500">{shipment.weight} kg</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Distance & Fee</p>
                                            <p className="font-semibold">{shipment.distanceKm} km</p>
                                            <p className="text-sm text-gray-500">{formatCurrency(shipment.platformFee)} platform fee</p>
                                        </div>
                                    </div>

                                    {shipment.pickupDate && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">Pickup Date</p>
                                                <p className="font-semibold">{formatDate(shipment.pickupDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {shipment.estimatedDeliveryDate && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-blue-600">Estimated Delivery</p>
                                                <p className="font-semibold text-blue-800">{formatDate(shipment.estimatedDeliveryDate)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Customer Information */}
                                {shipment.customer?.user && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Customer Information
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.customer.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.customer.user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.customer.user.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.customer.user.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Transporter Information */}
                                {shipment.transporter?.user && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Truck className="h-4 w-4" />
                                            Assigned Transporter
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.transporter.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.transporter.user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{shipment.transporter.user.phone}</span>
                                            </div>
                                            {shipment.transporter.rating && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-500">★</span>
                                                    <span>Rating: {shipment.transporter.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Vehicle Information */}
                                {shipment.vehicle && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Truck className="h-4 w-4" />
                                            Assigned Vehicle
                                        </h4>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Make & Model</p>
                                                <p className="font-semibold">{shipment.vehicle.make} {shipment.vehicle.model}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Registration</p>
                                                <p className="font-semibold font-mono">{shipment.vehicle.registrationNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Type & Year</p>
                                                <p className="font-semibold capitalize">{shipment.vehicle.type} ({shipment.vehicle.year})</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Tonnage</p>
                                                <p className="font-semibold">{shipment.vehicle.tonnage} tonnes</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                {shipment.specialInstructions && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Special Instructions</h4>
                                        <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                            {shipment.specialInstructions}
                                        </p>
                                    </div>
                                )}

                                {/* Accept/Reject buttons for shipments pending acceptance */}
                                {isShipmentPendingAcceptance(shipment) && (
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-amber-800">Action Required</p>
                                                <p className="text-sm text-amber-700">
                                                    This shipment needs your approval before it can be made available to transporters.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleAcceptShipmentClick(shipment)}
                                                disabled={isProcessingAction}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                {isProcessingAction ? "Processing..." : "Accept Shipment"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleRejectShipmentClick(shipment)}
                                                disabled={isProcessingAction}
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                {isProcessingAction ? "Processing..." : "Reject Shipment"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Display quotes if available */}
                                {shipment.status === ShipmentStatus.QUOTE_GENERATED &&
                                    shipment.quotes &&
                                    Array.isArray(shipment.quotes) &&
                                    shipment.quotes.filter((q) => q.status === QuoteStatus.PENDING).length > 0 && (
                                        <div className="border-t pt-4">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                Quotes Received
                                            </h3>
                                            <div className="space-y-4">
                                                {shipment.quotes
                                                    .filter((q) => q.status === QuoteStatus.PENDING)
                                                    .map((quote) => (
                                                        <Card key={quote.id} className="border-dashed border-2 border-green-200 bg-green-50">
                                                            <CardContent className="p-4">
                                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                                    <div>
                                                                        <p className="font-semibold text-green-800">
                                                                            {quote.transporter ? quote.transporter.user?.name : "N/A"}
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-green-600">
                                                                            {formatCurrency(quote.price)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-2 text-sm">
                                                                        <p><strong>Vehicle:</strong> {quote.vehicle ? `${quote.vehicle.make} ${quote.vehicle.model}` : "N/A"}</p>
                                                                        <p><strong>Pickup:</strong> {formatDate(quote.estimatedPickupDate)}</p>
                                                                        <p><strong>Delivery:</strong> {formatDate(quote.estimatedDeliveryDate)}</p>
                                                                    </div>
                                                                </div>
                                                                {quote.notes && (
                                                                    <p className="text-sm text-gray-600 mb-4 p-2 bg-white rounded border">
                                                                        <strong>Notes:</strong> {quote.notes}
                                                                    </p>
                                                                )}
                                                                <div className="flex gap-3">
                                                                    <Button
                                                                        onClick={() => handleApproveQuote(shipment.id, quote.id)}
                                                                        disabled={isProcessingAction}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        {isProcessingAction ? "Processing..." : "Approve Quote"}
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleRejectQuote(shipment.id, quote.id)}
                                                                        disabled={isProcessingAction}
                                                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                                        {isProcessingAction ? "Processing..." : "Reject Quote"}
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Show waiting message for pending shipments */}
                                {shipment.status === ShipmentStatus.PENDING && (!shipment.quotes || !Array.isArray(shipment.quotes) || shipment.quotes.length === 0) && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <p className="text-blue-700">Awaiting quotes from transporters...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Display past quotes for context */}
                                {shipment.quotes && Array.isArray(shipment.quotes) && shipment.quotes.filter((q) => q.status !== QuoteStatus.PENDING).length > 0 && (
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-600">Quote History</h3>
                                        <div className="space-y-3">
                                            {shipment.quotes
                                                .filter((q) => q.status !== QuoteStatus.PENDING)
                                                .map((quote) => (
                                                    <Card key={quote.id} className="border-gray-200 bg-gray-50">
                                                        <CardContent className="p-3">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-semibold">{quote.transporter ? quote.transporter.user?.name : "N/A"}</p>
                                                                    <p className="text-lg font-bold">{formatCurrency(quote.price)}</p>
                                                                </div>
                                                                <Badge variant={getQuoteStatusVariant(quote.status)} className="capitalize">
                                                                    {quote.status.replace(/_/g, " ")}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    {[
                                        ShipmentStatus.PENDING,
                                        ShipmentStatus.QUOTE_GENERATED,
                                        ShipmentStatus.QUOTE_APPROVED,
                                        ShipmentStatus.PICKUP_SCHEDULED,
                                        ShipmentStatus.IN_TRANSIT,
                                    ].includes(shipment.status) && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleCancelShipmentClick(shipment)}
                                            disabled={isProcessingAction}
                                            className="flex items-center gap-2"
                                        >
                                            <AlertCircle className="h-4 w-4" />
                                            {isProcessingAction ? "Processing..." : "Cancel Shipment"}
                                        </Button>
                                    )}
                                </div>

                                {/* Timestamps */}
                                <div className="text-xs text-gray-500 pt-4 border-t">
                                    <div className="flex justify-between">
                                        <span>Created: {formatDate(shipment.createdAt)}</span>
                                        <span>Updated: {formatDate(shipment.updatedAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Accept Shipment Confirmation Dialog */}
            <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Accept Shipment Request
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to accept shipment request{" "}
                            <span className="font-semibold font-mono">{shipmentToAccept?.trackingNumber}</span>?
                            This will make it available to transporters for quoting.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAcceptShipment}
                            disabled={isProcessingAction}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessingAction ? "Processing..." : "Accept Shipment"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Shipment Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Reject Shipment Request
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject shipment request{" "}
                            <span className="font-semibold font-mono">{shipmentToReject?.trackingNumber}</span>?
                            This action cannot be undone and the shipment will be cancelled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRejectShipment}
                            disabled={isProcessingAction}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessingAction ? "Processing..." : "Reject Shipment"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Shipment Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Cancel Shipment
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your shipment request{" "}
                            <span className="font-semibold font-mono">{shipmentToCancel?.trackingNumber}</span>.
                            Transporters will no longer be able to see or quote on this request.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingAction}>Keep Shipment</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancelShipment}
                            disabled={isProcessingAction}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessingAction ? "Cancelling..." : "Confirm Cancel"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}