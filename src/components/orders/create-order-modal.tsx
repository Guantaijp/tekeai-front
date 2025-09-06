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

interface OrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface CreateOrderModalProps {
  children?: React.ReactNode
  onOrderCreated?: (order: any) => void
}

export function CreateOrderModal({ children, onOrderCreated }: CreateOrderModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    supplierEmail: "",
    notes: "",
    expectedDeliveryDate: "",
    lpoFile: null as File | null,
  })

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

      // Prepare API data
      const orderData = {
        type: OrderType.PURCHASE, // This is an order we're sending (we're buying)
        buyerEmail: formData.supplierEmail, // In this context, we're the buyer
        items: validItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.quantity) * Number(item.unitPrice)
        })),
        notes: formData.notes.trim() || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      }

      // Call the API
      const response = await orderService.createOrder(orderData as any)

      if (response.data.success) {
        const newOrder = response.data.data

        // Upload LPO if provided
        if (formData.lpoFile && newOrder.id) {
          try {
            await orderService.uploadLPO(newOrder.id, formData.lpoFile)
          } catch (lpoError) {
            console.warn("Failed to upload LPO:", lpoError)
            // Continue even if LPO upload fails
          }
        }

        onOrderCreated?.(newOrder)

        toast({
          title: "Order created successfully!",
          description: `Order ${newOrder.orderNumber} has been sent to the supplier.`,
        })

        // Reset form
        setFormData({
          supplierEmail: "",
          notes: "",
          expectedDeliveryDate: "",
          lpoFile: null,
        })
        setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0 }])
        setOpen(false)
      }
    } catch (error: any) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Order
              </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Create New Order</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Fill out the form below to create a new order and send it to a supplier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Supplier Email</Label>
                <Input
                    id="supplier-email"
                    type="email"
                    placeholder="e.g., supplier@example.com"
                    value={formData.supplierEmail}
                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-date">Expected Delivery Date (Optional)</Label>
                <Input
                    id="delivery-date"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                  id="notes"
                  placeholder="Any additional notes about this order"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lpo-file">Attach LPO (Optional)</Label>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Order..." : "Create Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  )
}