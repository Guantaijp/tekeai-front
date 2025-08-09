"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Route, Milestone, Clock, Fuel, CheckCircle, Navigation } from "lucide-react"
import { trackingService } from "@/index"

const formSchema = z.object({
    origin: z.string().min(2, "Please enter a valid origin."),
    destination: z.string().min(2, "Please enter a valid destination."),
})

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
    console.log(result)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: "New York, NY",
            destination: "Los Angeles, CA",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setResult(null)

        try {
            const planRouteData = {
                origin: values.origin,
                destination: values.destination,
            }

            const response = await trackingService.planRoute(planRouteData)
            setResult(response.data.data)

            toast({
                title: "Route Planned Successfully!",
                description: "Your optimal route has been calculated.",
            })
        } catch (error) {
            console.error("Error planning route:", error)

            toast({
                title: "Route Planning Failed",
                description: "An error occurred while planning the route. Please try again.",
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
                <CardTitle className="font-headline">My Route Planner</CardTitle>
                <CardDescription>Plan your trips efficiently with our route planning service.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="origin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origin</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., New York, NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Los Angeles, CA" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
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
                            Planned Route
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
                                        <span>Distance: {result.distance} miles</span>
                                    </div>
                                    <div className="flex items-center font-medium">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Duration: {result.duration} minutes</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center font-medium text-green-600">
                                        <Fuel className="mr-2 h-4 w-4" />
                                        <span>Fuel Savings: {result.fuelSavings}</span>
                                    </div>
                                    <div className="flex items-center font-medium text-blue-600">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Time Savings: {result.timeSavings}</span>
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
                                    <div className="space-y-2">
                                        {result.steps.map((step, index) => (
                                            <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm">{step.instruction}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Distance: {step.distance} miles
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