"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { orderService, OrderType } from "@/order-management"
import {GooglePlacesInput} from "@/components/google-places-input";

interface OrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface LocationData {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId?: string
}

interface AddReceivedOrderModalProps {
  children?: React.ReactNode
  onOrderAdded?: (order: any) => void
}

export function AddReceivedOrderModal({ children, onOrderAdded }: AddReceivedOrderModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    expectedDeliveryDate: "",
    lpoFile: null as File | null,
  })

  // Location states
  const [originValue, setOriginValue] = useState("")
  const [destinationValue, setDestinationValue] = useState("")
  const [originLocation, setOriginLocation] = useState<LocationData | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null)

  const [items, setItems] = useState<OrderItem[]>([{
    id: "1",
    description: "",
    quantity: 1,
    unitPrice: 0
  }])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)
  }

  const resetForm = () => {
    setFormData({
      buyerName: "",
      buyerEmail: "",
      expectedDeliveryDate: "",
      lpoFile: null,
    })
    setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0 }])

    // Reset location states
    setOriginValue("")
    setDestinationValue("")
    setOriginLocation(null)
    setDestinationLocation(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate items before sending
      const validItems = items.filter(item =>
          item.description.trim() !== '' &&
          item.quantity > 0 &&
          item.unitPrice >= 0
      )

      if (validItems.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one valid item to the order.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Validate required fields
      if (!formData.buyerName.trim()) {
        toast({
          title: "Validation Error",
          description: "Buyer name is required.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!originLocation) {
        toast({
          title: "Validation Error",
          description: "Origin location is required.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!destinationLocation) {
        toast({
          title: "Validation Error",
          description: "Destination location is required.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Prepare API data matching your DTO structure
      const orderData = {
        type: "received", // Changed from SALE to RECEIVED
        buyerName: formData.buyerName.trim(),
        buyerEmail: formData.buyerEmail.trim() || undefined,
        origin: {
          address: originLocation.address,
          coordinates: originLocation.coordinates,
          placeId: originLocation.placeId
        },
        destination: {
          address: destinationLocation.address,
          coordinates: destinationLocation.coordinates,
          placeId: destinationLocation.placeId
        },
        items: validItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        orderDate: formData.expectedDeliveryDate || undefined,
      }

      // Call the API
      const response = await orderService.addReceivedOrder(orderData as any)

      // Check if response contains the order data directly or nested in data
      const newOrder = response.data || response

      if (newOrder && newOrder.id) {
        // Upload LPO if provided
        if (formData.lpoFile && newOrder.id) {
          try {
            await orderService.uploadLPO(newOrder.id, formData.lpoFile)
          } catch (lpoError) {
            console.warn("Failed to upload LPO:", lpoError)
            // Continue even if LPO upload fails
          }
        }

        // Call the callback with the new order
        onOrderAdded?.(newOrder)

        toast({
          title: "Order added successfully!",
          description: `Order ${newOrder.orderNumber} has been added to your received orders.`,
        })

        // Reset form and close modal
        resetForm()
        setOpen(false)
      } else {
        throw new Error("Order was not created properly")
      }
    } catch (error: any) {
      console.error("Error adding received order:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to add order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
              <Button variant="outline" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Received Order
              </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Add Received Order</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Fill out the form below to manually enter an order you have received from a customer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer-name">Buyer Name *</Label>
                <Input
                    id="buyer-name"
                    type="text"
                    placeholder="e.g., John Smith"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer-email">Buyer Email</Label>
                <Input
                    id="buyer-email"
                    type="email"
                    placeholder="e.g., customer@example.com"
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <GooglePlacesInput
                    id="origin"
                    label="Origin (Pickup Location) *"
                    value={originValue}
                    onChange={(e) => setOriginValue(e.target.value)}
                    onPlaceSelected={setOriginLocation}
                    placeholder="Enter pickup location in Kenya..."
                />
              </div>

              <div className="space-y-2">
                <GooglePlacesInput
                    id="destination"
                    label="Destination (Delivery Location) *"
                    value={destinationValue}
                    onChange={(e) => setDestinationValue(e.target.value)}
                    onPlaceSelected={setDestinationLocation}
                    placeholder="Enter delivery location in Kenya..."
                />
              </div>
            </div>

            {/* Show selected locations summary */}
            {(originLocation || destinationLocation) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Locations:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    {originLocation && (
                        <div><span className="font-medium">From:</span> {originLocation.address}</div>
                    )}
                    {destinationLocation && (
                        <div><span className="font-medium">To:</span> {destinationLocation.address}</div>
                    )}
                  </div>
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="delivery-date">Order Date</Label>
              <Input
                  id="delivery-date"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lpo-file">Attach LPO</Label>
              <Input
                  id="lpo-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setFormData({ ...formData, lpoFile: e.target.files?.[0] || null })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                            placeholder="Item Description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                            type="number"
                            placeholder="Qty"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                            required
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                            type="number"
                            placeholder="Unit Price ($)"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                            required
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                ))}
              </div>

              <div className="flex justify-end">
                <div className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding Order..." : "Add Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  )
}