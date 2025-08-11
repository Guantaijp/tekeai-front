"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Route, Milestone, Clock, Fuel, CheckCircle, Navigation, RotateCcw } from "lucide-react"
import { GooglePlacesInput } from "./google-places-input"

const formSchema = z.object({
    origin: z.string().min(2, "Please select a valid origin location."),
    destination: z.string().min(2, "Please select a valid destination location."),
})

interface Coordinates {
    lat: number
    lng: number
}

interface LocationData {
    address: string
    coordinates: Coordinates
    placeId?: string
}

interface RouteStep {
    instruction: string
    distance: number
}

interface RoutePlanData {
    route: string
    distance: number
    duration: number
    fuelSavings: string
    optimizedRoute: boolean
    steps: RouteStep[]
    timeSavings: string
}

export function RoutePlanner() {
    const [result, setResult] = useState<RoutePlanData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [originLocation, setOriginLocation] = useState<LocationData | null>(null)
    const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null)
    const [previewDistance, setPreviewDistance] = useState<string | null>(null)
    const [previewDuration, setPreviewDuration] = useState<string | null>(null)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: "",
            destination: "",
        },
    })

    // Calculate preview distance when both locations are selected
    useEffect(() => {
        if (originLocation && destinationLocation && window.google) {
            const service = new window.google.maps.DistanceMatrixService()
            service.getDistanceMatrix({
                origins: [originLocation.coordinates],
                destinations: [destinationLocation.coordinates],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
            }, (response: any, status: any) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const element = response.rows[0].elements[0]
                    setPreviewDistance(element.distance.text)
                    setPreviewDuration(element.duration.text)
                }
            })
        } else {
            setPreviewDistance(null)
            setPreviewDuration(null)
        }
    }, [originLocation, destinationLocation])

    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('origin', e.target.value)
        if (!e.target.value) {
            setOriginLocation(null)
        }
    }

    const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('destination', e.target.value)
        if (!e.target.value) {
            setDestinationLocation(null)
        }
    }

    const handleOriginPlaceSelected = (place: LocationData | null) => {
        setOriginLocation(place)
        if (place) {
            form.setValue('origin', place.address)
        }
    }

    const handleDestinationPlaceSelected = (place: LocationData | null) => {
        setDestinationLocation(place)
        if (place) {
            form.setValue('destination', place.address)
        }
    }

    const handleSwapLocations = () => {
        const tempOrigin = form.getValues('origin')
        const tempDestination = form.getValues('destination')
        const tempOriginLocation = originLocation
        const tempDestinationLocation = destinationLocation

        form.setValue('origin', tempDestination)
        form.setValue('destination', tempOrigin)
        setOriginLocation(tempDestinationLocation)
        setDestinationLocation(tempOriginLocation)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!originLocation || !destinationLocation) {
            toast({
                title: "Missing Location Data",
                description: "Please select both origin and destination from the suggestions.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            // Use Google Maps Directions Service for real routing
            const directionsService = new window.google.maps.DirectionsService()

            const directionsResult = await new Promise<any>((resolve, reject) => {
                directionsService.route({
                    origin: originLocation.coordinates,
                    destination: destinationLocation.coordinates,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    optimizeWaypoints: true,
                    avoidHighways: false,
                    avoidTolls: false
                }, (result, status) => {
                    if (status === 'OK') {
                        resolve(result)
                    } else {
                        reject(new Error(`Directions request failed: ${status}`))
                    }
                })
            })

            const route = directionsResult.routes[0]
            const leg = route.legs[0]

            // Generate step-by-step instructions
            const steps: RouteStep[] = leg.steps.map((step: any, index: number) => ({
                instruction: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
                distance: parseFloat((step.distance.value / 1000).toFixed(1)) // Convert to km
            }))

            // Calculate estimated fuel and time savings (mock calculations)
            const distanceKm = leg.distance.value / 1000
            const durationMinutes = leg.duration.value / 60
            const estimatedFuelSavings = (distanceKm * 0.05).toFixed(1) // Mock: 5% savings
            const estimatedTimeSavings = Math.round(durationMinutes * 0.1) // Mock: 10% savings

            const routeData: RoutePlanData = {
                route: `Route from ${originLocation.address} to ${destinationLocation.address}`,
                distance: parseFloat((distanceKm).toFixed(1)),
                duration: Math.round(durationMinutes),
                fuelSavings: `${estimatedFuelSavings} L`,
                timeSavings: `${estimatedTimeSavings} min`,
                optimizedRoute: route.optimized_waypoint_order?.length > 0,
                steps: steps
            }

            setResult(routeData)

            toast({
                title: "Route Planned Successfully!",
                description: "Your optimal route has been calculated using real-time data.",
            })

        } catch (error) {
            console.error("Error planning route:", error)

            toast({
                title: "Route Planning Failed",
                description: "Unable to calculate route. Please check your locations and try again.",
                variant: "destructive",
            })

            // Set fallback error result
            setResult({
                route: "An error occurred while planning the route. Please try again.",
                distance: 0,
                duration: 0,
                fuelSavings: "N/A",
                optimizedRoute: false,
                steps: [],
                timeSavings: "N/A",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Smart Route Planner</CardTitle>
                <CardDescription>
                    Plan your trips efficiently with real-time routing and location data for Kenya.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Origin Input */}
                            <FormField
                                control={form.control}
                                name="origin"
                                render={({ field }) => (
                                    <FormItem>
                                        <GooglePlacesInput
                                            id="origin-input"
                                            label="From (Origin)"
                                            value={field.value}
                                            onChange={handleOriginChange}
                                            onPlaceSelected={handleOriginPlaceSelected}
                                            placeholder="Enter pickup location in Kenya..."
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Swap Button */}
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSwapLocations}
                                    disabled={!form.getValues('origin') && !form.getValues('destination')}
                                    title="Swap origin and destination"
                                    className="h-8 w-8 p-0"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Destination Input */}
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <GooglePlacesInput
                                            id="destination-input"
                                            label="To (Destination)"
                                            value={field.value}
                                            onChange={handleDestinationChange}
                                            onPlaceSelected={handleDestinationPlaceSelected}
                                            placeholder="Enter destination in Kenya..."
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Route Preview */}
                        {originLocation && destinationLocation && previewDistance && previewDuration && (
                            <Alert>
                                <Route className="h-4 w-4" />
                                <AlertTitle>Route Preview</AlertTitle>
                                <AlertDescription>
                                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                        <div className="flex items-center">
                                            <Milestone className="mr-2 h-4 w-4" />
                                            <span>Distance: {previewDistance}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>Duration: {previewDuration}</span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isLoading || !originLocation || !destinationLocation}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Plan Route
                        </Button>
                    </CardFooter>
                </form>
            </Form>

            {result && (
                <CardContent>
                    <Alert className="mt-4">
                        <Route className="h-4 w-4" />
                        <AlertTitle className="font-headline flex items-center gap-2">
                            Optimized Route
                            {result.optimizedRoute && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                        </AlertTitle>
                        <AlertDescription>
                            <p className="mb-4">{result.route}</p>

                            {/* Route Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center font-medium">
                                        <Milestone className="mr-2 h-4 w-4" />
                                        <span>Distance: {result.distance} km</span>
                                    </div>
                                    <div className="flex items-center font-medium">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Duration: {result.duration} minutes</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center font-medium text-green-600">
                                        <Fuel className="mr-2 h-4 w-4" />
                                        <span>Est. Fuel Savings: {result.fuelSavings}</span>
                                    </div>
                                    <div className="flex items-center font-medium text-blue-600">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Est. Time Savings: {result.timeSavings}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Route Optimization Badge */}
                            {result.optimizedRoute && (
                                <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-md">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                        This route has been optimized for efficiency
                                    </span>
                                </div>
                            )}

                            {/* Step-by-step directions */}
                            {result.steps && result.steps.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Navigation className="h-4 w-4" />
                                        <p className="font-medium">Step-by-step directions:</p>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {result.steps.map((step, index) => (
                                            <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Distance: {step.distance} km
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
        </Card>
    )
}