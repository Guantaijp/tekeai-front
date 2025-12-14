"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Upload, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateOrderId } from "@/lib/utils"

interface OrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export function PublicOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    company: "",
    shippingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    specialInstructions: "",
    lpoFile: null as File | null,
  })

  const [items, setItems] = useState<OrderItem[]>([{ id: "1", description: "", quantity: 1, unitPrice: 0 }])

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
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const orderData = {
        id: generateOrderId(),
        customerInfo: formData,
        items: items.filter((item) => item.description.trim() !== ""),
        total: calculateTotal(),
        submittedAt: new Date().toISOString(),
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("[v0] Order submitted:", orderData)

      setIsSubmitted(true)

      toast({
        title: "Order submitted successfully!",
        description: "Thank you for your order. We'll be in touch soon.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Order Submitted Successfully!</CardTitle>
            <CardDescription>
              Thank you for your order. We have received your request and will contact you shortly with confirmation
              details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  customerName: "",
                  email: "",
                  phone: "",
                  company: "",
                  shippingAddress: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  specialInstructions: "",
                  lpoFile: null,
                })
                setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0 }])
              }}
              variant="outline"
              className="w-full"
            >
              Submit Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-xl">kasi</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Submit Your Order</h1>
          <p className="text-muted-foreground">
            Please fill out the form below with your order details. All fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Please provide your contact and shipping details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corporation"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-address">
                  Shipping Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="shipping-address"
                  placeholder="123 Main Street, Apt 4B"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Miami"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="FL"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip-code">
                    ZIP Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="zip-code"
                    placeholder="33101"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>Add the items you would like to order.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor={`item-description-${item.id}`}>
                      Item Description <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`item-description-${item.id}`}
                      placeholder="e.g., Hand-woven Basket"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label htmlFor={`item-quantity-${item.id}`}>
                      Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`item-quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <Label htmlFor={`item-price-${item.id}`}>Unit Price ($)</Label>
                    <Input
                      id={`item-price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
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

              {calculateTotal() > 0 && (
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">Estimated Total: ${calculateTotal().toFixed(2)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional details and file attachments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special delivery instructions or notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lpo-file">Attach Local Purchase Order (LPO)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lpo-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => setFormData({ ...formData, lpoFile: e.target.files?.[0] || null })}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
              {isLoading ? "Submitting Order..." : "Submit Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
