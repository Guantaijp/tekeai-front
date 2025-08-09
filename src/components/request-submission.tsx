"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { shipmentService } from "@/index"
import { Separator } from "@/components/ui/separator"
import { type ShipmentCreationResponseData, ShipmentStatus } from "@/types/api"
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
import { GooglePlacesInput } from "@/components/google-places-input"
import { RotateCcw, ArrowRight, MapPin } from "lucide-react"

// Define the LocationData type to match the backend model
interface Coordinates {
    lat: number
    lng: number
}

interface LocationData {
    address: string
    coordinates: Coordinates
    placeId?: string
    formattedAddress?: string
}

// Define the approval/rejection payload interface
interface ShipmentApprovalData {
    shipmentId: string
    approvedPrice: number
}

const formSchema = z.object({
    originAddress: z.string().min(2, { message: "Origin address must be at least 2 characters." }),
    originLat: z.number().optional(),
    originLng: z.number().optional(),
    originLocationData: z.any().optional(), // Use z.any() for JSONB object

    destinationAddress: z.string().min(2, { message: "Destination address must be at least 2 characters." }),
    destinationLat: z.number().optional(),
    destinationLng: z.number().optional(),
    destinationLocationData: z.any().optional(), // Use z.any() for JSONB object

    itemDescription: z.string().min(10, { message: "Item description must be at least 10 characters." }),
    weight: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val === "") return true // Optional field
                const num = Number.parseFloat(val)
                return !isNaN(num) && num > 0
            },
            { message: "Weight must be a valid positive number" },
        ),
    specialInstructions: z.string().optional(),
    preferredPickupDate: z.string().optional(),
})

export function RequestSubmission() {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [shipmentData, setShipmentData] = useState<ShipmentCreationResponseData | null>(null)
    const [isProcessingAction, setIsProcessingAction] = useState(false)
    const [distance, setDistance] = useState<string | null>(null)
    const [duration, setDuration] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originAddress: "",
            originLat: undefined,
            originLng: undefined,
            originLocationData: undefined,
            destinationAddress: "",
            destinationLat: undefined,
            destinationLng: undefined,
            destinationLocationData: undefined,
            itemDescription: "",
            weight: "",
            specialInstructions: "",
            preferredPickupDate: "",
        },
    })

    // Watch for changes in origin and destination coordinates to calculate distance
    const originLat = form.watch("originLat")
    const originLng = form.watch("originLng")
    const destinationLat = form.watch("destinationLat")
    const destinationLng = form.watch("destinationLng")

    // Calculate distance when both locations are selected
    useEffect(() => {
        if (originLat && originLng && destinationLat && destinationLng && window.google) {
            const service = new window.google.maps.DistanceMatrixService()
            service.getDistanceMatrix({
                origins: [{ lat: originLat, lng: originLng }],
                destinations: [{ lat: destinationLat, lng: destinationLng }],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, (response: any, status: any) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const element = response.rows[0].elements[0]
                    setDistance(element.distance.text)
                    setDuration(element.duration.text)
                } else {
                    setDistance(null)
                    setDuration(null)
                }
            })
        } else {
            setDistance(null)
            setDuration(null)
        }
    }, [originLat, originLng, destinationLat, destinationLng])

    const formatDateTime = (isoString: string | null | undefined) => {
        if (!isoString) return "N/A"
        try {
            const date = new Date(isoString)
            return date.toLocaleString()
        } catch {
            return "N/A"
        }
    }

    const formatCurrency = (amount: number | string | undefined | null) => {
        const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
        return num ? num.toFixed(2) : "0.00"
    }

    const handleSwapLocations = () => {
        const originAddress = form.getValues("originAddress")
        const originLat = form.getValues("originLat")
        const originLng = form.getValues("originLng")
        const originLocationData = form.getValues("originLocationData")

        const destinationAddress = form.getValues("destinationAddress")
        const destinationLat = form.getValues("destinationLat")
        const destinationLng = form.getValues("destinationLng")
        const destinationLocationData = form.getValues("destinationLocationData")

        // Swap the values
        form.setValue("originAddress", destinationAddress)
        form.setValue("originLat", destinationLat)
        form.setValue("originLng", destinationLng)
        form.setValue("originLocationData", destinationLocationData)

        form.setValue("destinationAddress", originAddress)
        form.setValue("destinationLat", originLat)
        form.setValue("destinationLng", originLng)
        form.setValue("destinationLocationData", originLocationData)

        toast({
            title: "Locations Swapped",
            description: "Origin and destination have been switched.",
        })
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const shipmentRequestData = {
                originAddress: values.originAddress,
                originLat: values.originLat,
                originLng: values.originLng,
                originLocationData: values.originLocationData,
                destinationAddress: values.destinationAddress,
                destinationLat: values.destinationLat,
                destinationLng: values.destinationLng,
                destinationLocationData: values.destinationLocationData,
                itemDescription: values.itemDescription,
                weight: values.weight ? Number.parseFloat(values.weight) : undefined,
                specialInstructions: values.specialInstructions || undefined,
                preferredPickupDate: values.preferredPickupDate || undefined,
            }
            console.log("Sending shipment data:", shipmentRequestData)
            const response = await shipmentService.createShipment(shipmentRequestData as any)

            // Debug logging to check response structure
            console.log("Full API response:", response)
            console.log("Response data:", response.data)
            console.log("Response data.data:", response.data?.data)

            // Try different possible response structures
            let responseData = null;
            if (response.data?.data) {
                responseData = response.data.data;
            } else if (response.data) {
                responseData = response.data;
            } else if (response) {
                responseData = response;
            }

            console.log("Setting shipmentData to:", responseData)

            if (responseData && responseData.shipment) {
                // Store the response data and show approval dialog
                setShipmentData(responseData)
                setShowApprovalDialog(true)
                console.log("Dialog should be showing now. shipmentData:", responseData)
                console.log("showApprovalDialog:", true)

                toast({
                    title: "Request Created Successfully!",
                    description: `Your shipment request has been created with tracking number ${responseData.shipment.trackingNumber}. Please review and approve to make it available to transporters.`,
                })
            } else {
                console.error("No valid response data found or missing shipment data")
                console.error("Response structure:", responseData)
                toast({
                    title: "Warning",
                    description: "Request created but could not load details for approval. Please refresh and try again.",
                    variant: "destructive",
                })
            }
        } catch (error: any) {
            console.error("Error creating shipment:", error)
            toast({
                title: "Submission Failed",
                description: error.response?.data?.message || "There was an error submitting your request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleApproveShipment = async () => {
        if (!shipmentData) return
        setIsProcessingAction(true)
        try {
            // Prepare approval data with shipmentId and approvedPrice (using customerPrice)
            const approvalData: ShipmentApprovalData = {
                shipmentId: shipmentData.shipment.id,
                approvedPrice: shipmentData.priceQuote?.customerPrice || 0
            }

            console.log("Approving shipment with data:", approvalData)

            // Call your approval endpoint - adjust this based on your actual API
            await shipmentService.approveShipment(approvalData)

            toast({
                title: "Shipment Approved!",
                description: `Your shipment request (${shipmentData.shipment.trackingNumber}) has been approved with price Ksh ${formatCurrency(approvalData.approvedPrice)} and is now live for transporters.`,
            })
            handleCloseDialog()
            form.reset()
        } catch (error: any) {
            console.error("Error approving shipment:", error)
            toast({
                title: "Approval Failed",
                description: error.response?.data?.message || "There was an error approving your request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleRejectShipment = async () => {
        if (!shipmentData) return
        setIsProcessingAction(true)
        try {
            // Prepare rejection data with shipmentId
            const rejectionData = {
                shipmentId: shipmentData.shipment.id
            }

            console.log("Rejecting shipment with data:", rejectionData)

            // Call your rejection endpoint - adjust this based on your actual API
            await shipmentService.rejectShipment(rejectionData)

            toast({
                title: "Shipment Rejected",
                description: `Your shipment request (${shipmentData.shipment.trackingNumber}) has been rejected and will not be shown to transporters.`,
            })
            handleCloseDialog()
            form.reset()
        } catch (error: any) {
            console.error("Error rejecting shipment:", error)
            toast({
                title: "Rejection Failed",
                description: error.response?.data?.message || "There was an error rejecting your request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleCloseDialog = () => {
        setShowApprovalDialog(false)
        setShipmentData(null)
        setDistance(null)
        setDuration(null)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Submit a New Transport Request</CardTitle>
                    <CardDescription>
                        Fill in the details below. After submission, you'll need to review and decide whether to approve or reject
                        the request with the estimated price.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            {/* Location Selection Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Route Information</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSwapLocations}
                                        disabled={!form.getValues("originAddress") && !form.getValues("destinationAddress")}
                                        className="p-2 hover:bg-gray-50"
                                        title="Swap origin and destination"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="originAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>From (Origin)</FormLabel>
                                                <FormControl>
                                                    <GooglePlacesInput
                                                        label=""
                                                        id="originAddress"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Enter pickup location..."
                                                        onPlaceSelected={(place) => {
                                                            if (place) {
                                                                form.setValue("originAddress", place.address)
                                                                form.setValue("originLat", place.coordinates.lat)
                                                                form.setValue("originLng", place.coordinates.lng)
                                                                form.setValue("originLocationData", place)
                                                            } else {
                                                                form.setValue("originLat", undefined)
                                                                form.setValue("originLng", undefined)
                                                                form.setValue("originLocationData", undefined)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="destinationAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>To (Destination)</FormLabel>
                                                <FormControl>
                                                    <GooglePlacesInput
                                                        label=""
                                                        id="destinationAddress"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Enter destination..."
                                                        onPlaceSelected={(place) => {
                                                            if (place) {
                                                                form.setValue("destinationAddress", place.address)
                                                                form.setValue("destinationLat", place.coordinates.lat)
                                                                form.setValue("destinationLng", place.coordinates.lng)
                                                                form.setValue("destinationLocationData", place)
                                                            } else {
                                                                form.setValue("destinationLat", undefined)
                                                                form.setValue("destinationLng", undefined)
                                                                form.setValue("destinationLocationData", undefined)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Route Summary */}
                                {(originLat && originLng && destinationLat && destinationLng) && (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Route Summary
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {distance && (
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-gray-700">Distance:</span>
                                                    <span className="ml-2 text-gray-600">{distance}</span>
                                                </div>
                                            )}
                                            {duration && (
                                                <div className="flex items-center">
                                                    <ArrowRight className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-gray-700">Duration:</span>
                                                    <span className="ml-2 text-gray-600">{duration}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Item Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>

                                <FormField
                                    control={form.control}
                                    name="itemDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe the item(s) you need to transport." {...field} />
                                            </FormControl>
                                            <FormDescription>Include details like dimensions, fragility, and quantity.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Weight (kg) - Optional</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" min="0.1" placeholder="e.g., 50" {...field} />
                                                </FormControl>
                                                <FormDescription>Enter weight in kilograms</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preferredPickupDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preferred Pickup Date & Time - Optional</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} />
                                                </FormControl>
                                                <FormDescription>Specify a preferred date and time for pickup.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="specialInstructions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Special Instructions - Optional</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Any specific handling or delivery notes?" {...field} />
                                            </FormControl>
                                            <FormDescription>e.g., "Deliver only after 5 PM", "Fragile, handle with care"</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? "Creating Request..." : "Create Request"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            {/* Approval/Rejection Dialog */}
            {showApprovalDialog && (
                <AlertDialog open={showApprovalDialog} onOpenChange={(open) => {
                    console.log("Dialog open state changing to:", open)
                    setShowApprovalDialog(open)
                }}>
                    <AlertDialogContent className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline text-blue-600">
                                Review & Approve Transport Request
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Please review the shipment details and estimated price below. You can approve with the suggested price or reject this request.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {!shipmentData ? (
                            <CardContent className="space-y-6">
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Loading shipment details...</p>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="space-y-6">
                                {/* Debug Information - Remove this in production */}
                                <div className="bg-gray-100 p-2 rounded text-xs">
                                    <p><strong>Debug:</strong> Dialog State: {showApprovalDialog ? "Open" : "Closed"}</p>
                                    <p><strong>Shipment Data:</strong> {shipmentData ? "Loaded" : "Not Loaded"}</p>
                                    {shipmentData && (
                                        <p><strong>Shipment ID:</strong> {shipmentData.shipment?.id || "No ID"}</p>
                                    )}
                                </div>

                                {/* Shipment Overview */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">Shipment Overview</h4>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Item:</span> {shipmentData.shipment?.itemDescription || "N/A"}</p>
                                        <p><span className="font-medium">From:</span> {shipmentData.shipment?.originAddress || "N/A"}</p>
                                        <p><span className="font-medium">To:</span> {shipmentData.shipment?.destinationAddress || "N/A"}</p>
                                        <p><span className="font-medium">Distance:</span> {shipmentData.shipment?.distanceKm || "N/A"} km</p>
                                        {shipmentData.shipment?.weight && (
                                            <p><span className="font-medium">Weight:</span> {shipmentData.shipment.weight} kg</p>
                                        )}
                                    </div>
                                </div>

                                {/* Price Approval Section */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-medium text-green-800">Customer Price to Approve:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            Ksh {formatCurrency(shipmentData.priceQuote?.customerPrice)}
                                        </span>
                                    </div>
                                    <div className="text-sm space-y-1 text-green-600">
                                        <p>Transporter Payout: Ksh {formatCurrency(shipmentData.priceQuote?.transporterPayout)}</p>
                                        <p>Platform Fee: Ksh {formatCurrency(shipmentData.priceQuote?.platformFee)}</p>
                                        <p className="mt-2">By approving, transporters will see this shipment with this price.</p>
                                    </div>
                                </div>

                                {/* Route Information */}
                                {shipmentData.priceQuote && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-2">Route Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Distance:</span>
                                                <p className="text-gray-700">{shipmentData.priceQuote.distanceKm} km</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Estimated Duration:</span>
                                                <p className="text-gray-700">{shipmentData.priceQuote.estimatedDuration} minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed Shipment Information */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Complete Shipment Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Tracking Number:</span>
                                            <p className="font-mono mt-1">{shipmentData.shipment?.trackingNumber || "N/A"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Status:</span>
                                            <p className="mt-1">{shipmentData.shipment?.status || "N/A"}</p>
                                        </div>
                                        {shipmentData.shipment?.specialInstructions && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-600">Special Instructions:</span>
                                                <p className="mt-1">{shipmentData.shipment.specialInstructions}</p>
                                            </div>
                                        )}
                                        {shipmentData.shipment?.pickupDate && (
                                            <div>
                                                <span className="font-medium text-gray-600">Preferred Pickup:</span>
                                                <p className="mt-1">{formatDateTime(shipmentData.shipment.pickupDate)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Price Breakdown */}
                                {shipmentData.priceQuote?.breakdown && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">Price Breakdown</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Base Rate Cost:</span>
                                                <span>Ksh {formatCurrency(shipmentData.priceQuote.breakdown.baseRateCost)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Fuel Cost:</span>
                                                <span>Ksh {formatCurrency(shipmentData.priceQuote.breakdown.fuelCost)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Transport Cost:</span>
                                                <span>Ksh {formatCurrency(shipmentData.priceQuote.breakdown.totalTransportCost)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Platform Margin:</span>
                                                <span>Ksh {formatCurrency(shipmentData.priceQuote.breakdown.margin)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span>Transporter Payout:</span>
                                                <span className="font-semibold text-blue-600">Ksh {formatCurrency(shipmentData.priceQuote.transporterPayout)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Platform Fee:</span>
                                                <span className="font-semibold text-gray-600">Ksh {formatCurrency(shipmentData.priceQuote.platformFee)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Customer Total Price:</span>
                                                <span className="text-primary">Ksh {formatCurrency(shipmentData.priceQuote.customerPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Important Information */}
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        <strong>Important:</strong> By approving this request with the customer price of Ksh {formatCurrency(shipmentData.priceQuote?.customerPrice)},
                                        it will become visible to transporters who can accept this delivery. If you reject this request,
                                        it will be cancelled and no transporters will see it.
                                    </p>
                                </div>
                            </CardContent>
                        )}

                        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
                            <AlertDialogCancel
                                onClick={handleRejectShipment}
                                disabled={isProcessingAction || !shipmentData}
                                className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                            >
                                {isProcessingAction ? "Processing..." : "Reject Request"}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleApproveShipment}
                                disabled={isProcessingAction || !shipmentData}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                            >
                                {isProcessingAction ? "Processing..." : `Approve for Ksh ${formatCurrency(shipmentData?.priceQuote?.customerPrice)}`}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}