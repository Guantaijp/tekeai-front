"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fleetService } from "@/index"

const vehicleSchema = z.object({
    registrationNumber: z.string().min(1, "Registration number is required"),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z
        .number()
        .min(1900, "Invalid year")
        .max(new Date().getFullYear() + 1, "Invalid year"),
    type: z.string().min(1, "Type is required"),
    tonnage: z.number().min(0.1, "Tonnage must be greater than 0"),
    fuelConsumptionPerKm: z.number().min(0.01, "Fuel consumption must be greater than 0"),
    insuranceNumber: z.string().min(1, "Insurance number is required"),
    insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required"),
})

interface Vehicle {
    id: string
    registrationNumber: string
    make: string
    model: string
    year: number
    type: string
    tonnage: number
    fuelConsumptionPerKm: number
    insuranceNumber: string
    insuranceExpiryDate: string
    status?: string
}

export function MyFleet() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof vehicleSchema>>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            registrationNumber: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            type: "",
            tonnage: 0,
            fuelConsumptionPerKm: 0,
            insuranceNumber: "",
            insuranceExpiryDate: "",
        },
    })

    // Fetch vehicles on component mount
    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            setIsLoading(true)
            const response = await fleetService.getAllVehicles()
            // Add safety checks for the response structure
            const vehiclesData = response?.data?.data || response?.data || []
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
        } catch (error) {
            console.error("Error fetching vehicles:", error)
            // Set to empty array on error to prevent undefined issues
            setVehicles([])
            toast({
                title: "Error",
                description: "Failed to fetch vehicles. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: z.infer<typeof vehicleSchema>) => {
        setIsSubmitting(true)

        try {
            if (editingVehicle) {
                // Update existing vehicle
                await fleetService.updateVehicle(editingVehicle.id, values)
                toast({
                    title: "Vehicle Updated",
                    description: "Vehicle has been updated successfully.",
                })
                setIsEditDialogOpen(false)
                setEditingVehicle(null)
            } else {
                // Create new vehicle
                await fleetService.addVehicle(values)
                toast({
                    title: "Vehicle Added",
                    description: "New vehicle has been added to your fleet.",
                })
                setIsAddDialogOpen(false)
            }

            form.reset()
            fetchVehicles() // Refresh the list
        } catch (error) {
            console.error("Error saving vehicle:", error)
            toast({
                title: "Error",
                description: "Failed to save vehicle. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        form.reset({
            registrationNumber: vehicle.registrationNumber,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            type: vehicle.type,
            tonnage: vehicle.tonnage,
            fuelConsumptionPerKm: vehicle.fuelConsumptionPerKm,
            insuranceNumber: vehicle.insuranceNumber,
            insuranceExpiryDate: vehicle.insuranceExpiryDate,
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return

        try {
            await fleetService.deleteVehicle(id)
            toast({
                title: "Vehicle Deleted",
                description: "Vehicle has been removed from your fleet.",
            })
            fetchVehicles() // Refresh the list
        } catch (error) {
            console.error("Error deleting vehicle:", error)
            toast({
                title: "Error",
                description: "Failed to delete vehicle. Please try again.",
                variant: "destructive",
            })
        }
    }

    const getStatusVariant = (
        status?: string,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        if (!status) return "outline"
        if (status.startsWith("On Job")) return "default"
        switch (status) {
            case "Available":
                return "outline"
            case "Maintenance":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const resetForm = () => {
        form.reset({
            registrationNumber: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            type: "",
            tonnage: 0,
            fuelConsumptionPerKm: 0,
            insuranceNumber: "",
            insuranceExpiryDate: "",
        })
        setEditingVehicle(null)
    }

    // Add safety check for vehicles array
    const safeVehicles = Array.isArray(vehicles) ? vehicles : []

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Manage My Fleet</CardTitle>
                    <CardDescription>Manage your vehicles and their details.</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Vehicle</DialogTitle>
                            <DialogDescription>Enter the details of your new vehicle to add it to your fleet.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="registrationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., KCA 123A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="make"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Make</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Toyota" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Hiace" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2020"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select vehicle type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="truck">Truck</SelectItem>
                                                        <SelectItem value="van">Van</SelectItem>
                                                        <SelectItem value="pickup">Pickup</SelectItem>
                                                        <SelectItem value="semi-trailer">Semi-trailer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tonnage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tonnage</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="5.0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fuelConsumptionPerKm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fuel Consumption (L/km)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.3"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="insuranceNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Insurance Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="INS123456" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="insuranceExpiryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Insurance Expiry Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Vehicle
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Vehicle</DialogTitle>
                            <DialogDescription>Update the details of your vehicle.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="registrationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., KCA 123A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="make"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Make</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Toyota" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Hiace" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2020"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select vehicle type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="truck">Truck</SelectItem>
                                                        <SelectItem value="van">Van</SelectItem>
                                                        <SelectItem value="pickup">Pickup</SelectItem>
                                                        <SelectItem value="semi-trailer">Semi-trailer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tonnage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tonnage</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="5.0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fuelConsumptionPerKm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fuel Consumption (L/km)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.3"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="insuranceNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Insurance Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="INS123456" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="insuranceExpiryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Insurance Expiry Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Vehicle
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading vehicles...</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Registration</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Tonnage</TableHead>
                                <TableHead>Insurance Expiry</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {safeVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No vehicles found. Add your first vehicle to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                safeVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell className="font-mono">{vehicle.registrationNumber}</TableCell>
                                        <TableCell className="font-medium">
                                            {vehicle.make} {vehicle.model} ({vehicle.year})
                                        </TableCell>
                                        <TableCell className="capitalize">{vehicle.type}</TableCell>
                                        <TableCell>{vehicle.tonnage}t</TableCell>
                                        <TableCell>{new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status || "Available"}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(vehicle.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}