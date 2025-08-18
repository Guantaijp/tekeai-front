"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Plus, Save, Fuel, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { pricingService, getGlobalFuelPrice, updateGlobalFuelPrice } from "@/index"
import type { PricingRule, CreatePricingRuleDto, UpdatePricingRuleDto, DeletePriceRuleDto } from "@/types/api"

export default function PricingModelPage() {
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
    console.log("Pricing rules", pricingRules)
    const [globalFuelPrice, setGlobalFuelPrice] = useState<number>(0)
    const [initialGlobalFuelPrice, setInitialGlobalFuelPrice] = useState<number>(0)
    const [modifiedRules, setModifiedRules] = useState<Set<string>>(new Set())
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState<boolean>(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [ruleToDelete, setRuleToDelete] = useState<PricingRule | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [newRuleData, setNewRuleData] = useState<CreatePricingRuleDto>({
        name: "",
        minWeight: 0,
        maxWeight: 0,
        fuelConsumptionPerKm: 0,
        baseRatePerKm: 0,
        fuelPricePerLitre: 0,
        platformMargin: 0.5,
        transporterPayoutPercentage: 0.7,
        isActive: true,
    })

    // Helper function to convert string values to numbers and handle nulls
    const normalizeRule = (rule: any): PricingRule => ({
        ...rule,
        minWeight: rule.minWeight ? Number.parseFloat(rule.minWeight) : 0,
        maxWeight: rule.maxWeight ? Number.parseFloat(rule.maxWeight) : 0,
        fuelConsumptionPerKm: rule.fuelConsumptionPerKm ? Number.parseFloat(rule.fuelConsumptionPerKm) : 0,
        baseRatePerKm: rule.baseRatePerKm ? Number.parseFloat(rule.baseRatePerKm) : 0,
        fuelPricePerLitre: rule.fuelPricePerLitre ? Number.parseFloat(rule.fuelPricePerLitre) : 0,
        platformMargin: rule.platformMargin ? Number.parseFloat(rule.platformMargin) : 0.5,
        transporterPayoutPercentage: rule.transporterPayoutPercentage
            ? Number.parseFloat(rule.transporterPayoutPercentage)
            : 0.7,
        name: rule.name || "Unnamed Rule",
        isActive: rule.isActive !== undefined ? rule.isActive : true,
    })

    const fetchPricingRules = useCallback(async () => {
        try {
            const response = await pricingService.getAllPricingRules()
            console.log("Raw response:", response)

            // Handle the response structure - the data is in response.data
            const rulesData = response.data.data || []
            console.log("Rules data:", rulesData)

            // Filter out rules with null essential values and normalize the data
            const validRules = rulesData
                .filter((rule: any) => {
                    // Only filter out rules where ALL essential fields are null
                    return (
                        rule.name !== null &&
                        rule.fuelConsumptionPerKm !== null &&
                        rule.baseRatePerKm !== null &&
                        rule.minWeight !== null &&
                        rule.maxWeight !== null
                    )
                })
                .map(normalizeRule)

            setPricingRules(validRules)
            console.log("Processed rules:", validRules)

            // Set global fuel price
            if (validRules.length > 0) {
                const currentGlobalPrice = getGlobalFuelPrice()
                setGlobalFuelPrice(currentGlobalPrice)
                setInitialGlobalFuelPrice(currentGlobalPrice)
                setNewRuleData((prev) => ({ ...prev, fuelPricePerLitre: currentGlobalPrice }))
            }
        } catch (error) {
            console.error("Error fetching pricing rules:", error)
        }
    }, [])

    useEffect(() => {
        fetchPricingRules()
    }, [fetchPricingRules])

    const handleRuleChange = (id: string, field: keyof PricingRule, value: string) => {
        setPricingRules((prevRules) =>
            prevRules.map((rule) =>
                rule.id === id
                    ? { ...rule, [field]: Number.parseFloat(value) || 0 } // Convert to number
                    : rule,
            ),
        )
        setModifiedRules((prev) => new Set(prev).add(id))
    }

    const handleGlobalFuelPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFuelPrice(Number.parseFloat(e.target.value) || 0)
    }

    const handleSaveAllChanges = async () => {
        setIsSaving(true)
        try {
            const updates: Promise<any>[] = []

            // Update global fuel price if changed
            if (globalFuelPrice !== initialGlobalFuelPrice) {
                updateGlobalFuelPrice(globalFuelPrice)
                // In a real scenario, you might have a separate API call for global settings
                // For this mock, we just update the internal state.
            }

            for (const ruleId of modifiedRules) {
                const ruleToUpdate = pricingRules.find((rule) => rule.id === ruleId)
                if (ruleToUpdate) {
                    const allRulesResponse = await pricingService.getAllPricingRules()
                    const originalRule = allRulesResponse.data.find((r: any) => r.id === ruleId) // Updated to use .data instead of .data.data
                    if (originalRule) {
                        const normalizedOriginal = normalizeRule(originalRule)
                        const updatePayload: UpdatePricingRuleDto = {}
                        if (ruleToUpdate.fuelConsumptionPerKm !== normalizedOriginal.fuelConsumptionPerKm) {
                            updatePayload.fuelConsumptionPerKm = ruleToUpdate.fuelConsumptionPerKm
                        }
                        if (ruleToUpdate.baseRatePerKm !== normalizedOriginal.baseRatePerKm) {
                            updatePayload.baseRatePerKm = ruleToUpdate.baseRatePerKm
                        }
                        if (Object.keys(updatePayload).length > 0) {
                            updates.push(pricingService.updatePricingRule(ruleId, updatePayload))
                        }
                    }
                }
            }

            await Promise.all(updates)
            setModifiedRules(new Set()) // Clear modified rules
            setInitialGlobalFuelPrice(globalFuelPrice) // Update initial global price
            alert("Changes saved successfully!")
        } catch (error) {
            console.error("Error saving changes:", error)
            alert("Failed to save changes.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleNewRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setNewRuleData((prev) => ({
            ...prev,
            [id]: [
                "minWeight",
                "maxWeight",
                "fuelConsumptionPerKm",
                "baseRatePerKm",
                "fuelPricePerLitre",
                "platformMargin",
                "transporterPayoutPercentage",
            ].includes(id)
                ? Number.parseFloat(value) || 0
                : value,
        }))
    }

    const handleCreateRule = async () => {
        try {
            const response = await pricingService.createPricingRule({
                ...newRuleData,
                fuelPricePerLitre: globalFuelPrice, // Ensure new rule uses current global fuel price
            })

            // Check if response has data property (indicating success)
            if (response.data) {
                const normalizedNewRule = normalizeRule(response.data)
                setPricingRules((prev) => [...prev, normalizedNewRule])
                setIsAddRuleDialogOpen(false)
                setNewRuleData({
                    name: "",
                    minWeight: 0,
                    maxWeight: 0,
                    fuelConsumptionPerKm: 0,
                    baseRatePerKm: 0,
                    fuelPricePerLitre: globalFuelPrice,
                    platformMargin: 0.5,
                    transporterPayoutPercentage: 0.7,
                    isActive: true,
                })
                alert(response.message || "New rule added successfully!")
            } else {
                console.error("Failed to create rule:", response.message)
                alert(response.message || "Failed to add new rule.")
            }
        } catch (error) {
            console.error("Error creating rule:", error)
            alert("Error adding new rule.")
        }
    }

    const handleEditRule = (rule: PricingRule) => {
        setEditingRule(rule)
        setIsEditDialogOpen(true)
    }

    const handleEditRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        if (editingRule) {
            setEditingRule((prev) => ({
                ...prev!,
                [id]: [
                    "minWeight",
                    "maxWeight",
                    "fuelConsumptionPerKm",
                    "baseRatePerKm",
                    "fuelPricePerLitre",
                    "platformMargin",
                    "transporterPayoutPercentage",
                ].includes(id)
                    ? Number.parseFloat(value) || 0
                    : value,
            }))
        }
    }

    const handleUpdateRule = async () => {
        if (!editingRule) return

        try {
            const updatePayload: UpdatePricingRuleDto = {
                name: editingRule.name,
                minWeight: editingRule.minWeight,
                maxWeight: editingRule.maxWeight,
                fuelConsumptionPerKm: editingRule.fuelConsumptionPerKm,
                baseRatePerKm: editingRule.baseRatePerKm,
                fuelPricePerLitre: editingRule.fuelPricePerLitre,
                platformMargin: editingRule.platformMargin,
                transporterPayoutPercentage: editingRule.transporterPayoutPercentage,
                isActive: editingRule.isActive,
            }

            const response = await pricingService.updatePricingRule(editingRule.id, updatePayload)

            if (response.data) {
                const normalizedUpdatedRule = normalizeRule(response.data)
                setPricingRules((prev) => prev.map((rule) => (rule.id === editingRule.id ? normalizedUpdatedRule : rule)))
                setIsEditDialogOpen(false)
                setEditingRule(null)
                alert("Rule updated successfully!")
            } else {
                console.error("Failed to update rule:", response.message)
                alert(response.message || "Failed to update rule.")
            }
        } catch (error) {
            console.error("Error updating rule:", error)
            alert("Error updating rule.")
        }
    }

    const handleDeleteRule = (rule: PricingRule) => {
        setRuleToDelete(rule)
        setDeleteDialogOpen(true)
    }

    const confirmDeleteRule = async () => {
        if (!ruleToDelete) return

        setIsDeleting(true)
        try {
            const deletePayload: DeletePriceRuleDto = {
                isActive: false, // Assuming soft delete by setting isActive to false
            }

            await pricingService.deletePriceRule(ruleToDelete.id, deletePayload)

            setPricingRules((prev) => prev.filter((rule) => rule.id !== ruleToDelete.id))
            setDeleteDialogOpen(false)
            setRuleToDelete(null)
            alert("Rule deleted successfully!")
        } catch (error) {
            console.error("Error deleting rule:", error)
            alert("Error deleting rule.")
        } finally {
            setIsDeleting(false)
        }
    }

    const hasChanges = modifiedRules.size > 0 || globalFuelPrice !== initialGlobalFuelPrice

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            <main className="flex-1 flex flex-col p-3 sm:p-6 overflow-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="grid gap-1">
                        <h1 className="text-xl sm:text-2xl font-bold">AI Pricing Model</h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Adjust the parameters used by the AI to calculate shipment prices.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Dialog open={isAddRuleDialogOpen} onOpenChange={setIsAddRuleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="sm:size-default">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Add Rule</span>
                                    <span className="xs:hidden">Add</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
                                <DialogHeader>
                                    <DialogTitle>Add New Pricing Rule</DialogTitle>
                                    <DialogDescription>Enter the details for the new pricing rule.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                        <Label htmlFor="name" className="sm:text-right">
                                            Tonnage Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newRuleData.name}
                                            onChange={handleNewRuleChange}
                                            className="sm:col-span-3"
                                            placeholder="e.g., 1T, 5T"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                        <Label htmlFor="minWeight" className="sm:text-right">
                                            Min Weight (Tons)
                                        </Label>
                                        <Input
                                            id="minWeight"
                                            type="number"
                                            value={newRuleData.minWeight}
                                            onChange={handleNewRuleChange}
                                            className="sm:col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                        <Label htmlFor="maxWeight" className="sm:text-right">
                                            Max Weight (Tons)
                                        </Label>
                                        <Input
                                            id="maxWeight"
                                            type="number"
                                            value={newRuleData.maxWeight}
                                            onChange={handleNewRuleChange}
                                            className="sm:col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                        <Label htmlFor="fuelConsumptionPerKm" className="sm:text-right">
                                            Fuel Consumption (L/km)
                                        </Label>
                                        <Input
                                            id="fuelConsumptionPerKm"
                                            type="number"
                                            value={newRuleData.fuelConsumptionPerKm}
                                            onChange={handleNewRuleChange}
                                            className="sm:col-span-3"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                        <Label htmlFor="baseRatePerKm" className="sm:text-right">
                                            Base Rate (KES/km)
                                        </Label>
                                        <Input
                                            id="baseRatePerKm"
                                            type="number"
                                            value={newRuleData.baseRatePerKm}
                                            onChange={handleNewRuleChange}
                                            className="sm:col-span-3"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateRule}>Add Rule</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Edit Rule Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
                        <DialogHeader>
                            <DialogTitle>Edit Pricing Rule</DialogTitle>
                            <DialogDescription>Update the details for this pricing rule.</DialogDescription>
                        </DialogHeader>
                        {editingRule && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                    <Label htmlFor="name" className="sm:text-right">
                                        Tonnage Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={editingRule.name}
                                        onChange={handleEditRuleChange}
                                        className="sm:col-span-3"
                                        placeholder="e.g., 1T, 5T"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                    <Label htmlFor="minWeight" className="sm:text-right">
                                        Min Weight (Tons)
                                    </Label>
                                    <Input
                                        id="minWeight"
                                        type="number"
                                        value={editingRule.minWeight}
                                        onChange={handleEditRuleChange}
                                        className="sm:col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                    <Label htmlFor="maxWeight" className="sm:text-right">
                                        Max Weight (Tons)
                                    </Label>
                                    <Input
                                        id="maxWeight"
                                        type="number"
                                        value={editingRule.maxWeight}
                                        onChange={handleEditRuleChange}
                                        className="sm:col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                    <Label htmlFor="fuelConsumptionPerKm" className="sm:text-right">
                                        Fuel Consumption (L/km)
                                    </Label>
                                    <Input
                                        id="fuelConsumptionPerKm"
                                        type="number"
                                        value={editingRule.fuelConsumptionPerKm}
                                        onChange={handleEditRuleChange}
                                        className="sm:col-span-3"
                                        step="0.01"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                    <Label htmlFor="baseRatePerKm" className="sm:text-right">
                                        Base Rate (KES/km)
                                    </Label>
                                    <Input
                                        id="baseRatePerKm"
                                        type="number"
                                        value={editingRule.baseRatePerKm}
                                        onChange={handleEditRuleChange}
                                        className="sm:col-span-3"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateRule}>Update Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pricing Rule</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the rule "{ruleToDelete?.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteRule}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="border rounded-lg bg-white dark:bg-gray-900">
                    {/* Desktop Table View - hidden on mobile */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Tonnage (Tons)</TableHead>
                                    <TableHead>Weight Range</TableHead>
                                    <TableHead>Fuel Consumption (L/km)</TableHead>
                                    <TableHead>Base Rate (KES/km)</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pricingRules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            No valid pricing rules found. Add a new rule to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pricingRules.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {rule.minWeight}T - {rule.maxWeight}T
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    <Input
                                                        type="number"
                                                        value={rule.fuelConsumptionPerKm}
                                                        onChange={(e) => handleRuleChange(rule.id, "fuelConsumptionPerKm", e.target.value)}
                                                        className="w-24 text-right"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 dark:text-gray-400">KES</span>
                                                    <Input
                                                        type="number"
                                                        value={rule.baseRatePerKm}
                                                        onChange={(e) => handleRuleChange(rule.id, "baseRatePerKm", e.target.value)}
                                                        className="w-24 text-right"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditRule(rule)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteRule(rule)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View - visible only on mobile and tablet */}
                    <div className="md:hidden">
                        {pricingRules.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 px-4">
                                No valid pricing rules found. Add a new rule to get started.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {pricingRules.map((rule) => (
                                    <div key={rule.id} className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-lg">{rule.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {rule.minWeight}T - {rule.maxWeight}T
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)} className="h-8 w-8 p-0">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteRule(rule)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-gray-500 uppercase tracking-wide">Fuel Consumption (L/km)</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    <Input
                                                        type="number"
                                                        value={rule.fuelConsumptionPerKm}
                                                        onChange={(e) => handleRuleChange(rule.id, "fuelConsumptionPerKm", e.target.value)}
                                                        className="flex-1 text-right"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-xs text-gray-500 uppercase tracking-wide">Base Rate (KES/km)</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">KES</span>
                                                    <Input
                                                        type="number"
                                                        value={rule.baseRatePerKm}
                                                        onChange={(e) => handleRuleChange(rule.id, "baseRatePerKm", e.target.value)}
                                                        className="flex-1 text-right"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/*<div className="mt-4 sm:mt-6 flex justify-end">*/}
                {/*    <Button*/}
                {/*        onClick={handleSaveAllChanges}*/}
                {/*        disabled={!hasChanges || isSaving}*/}
                {/*        size="sm"*/}
                {/*        className="sm:size-default"*/}
                {/*    >*/}
                {/*        {isSaving ? "Saving..." : "Save All Changes"}*/}
                {/*        <Save className="w-4 h-4 ml-2" />*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </main>
        </div>
    )
}
