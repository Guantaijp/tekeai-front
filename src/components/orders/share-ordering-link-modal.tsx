"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {orderService} from "@/order-management";

// Import your order service

// Define the DTO interface if not already imported
interface SendOrderInviteDto {
  customerEmail: string
  orderLink: string
  message?: string
  supplierName?: string
  // Add other fields as needed based on your backend DTO
}

export function ShareOrderingLinkModal() {
  const [open, setOpen] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")
  const [message, setMessage] = useState("")
  const [orderLink, setOrderLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateOrderLink = () => {
    // Generate a unique ordering link
    const linkId = Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/order/${linkId}`
    setOrderLink(link)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(orderLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The ordering link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const sendInvite = async () => {
    if (!customerEmail) {
      toast({
        title: "Email required",
        description: "Please enter a customer email address.",
        variant: "destructive",
      })
      return
    }

    if (!orderLink) {
      toast({
        title: "Link required",
        description: "Please generate an ordering link first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare the invite data
      const inviteData: SendOrderInviteDto = {
        customerEmail,
        orderLink,
        message: message || undefined,
        supplierName: "Your Company Name", // Replace with actual supplier name
        // Add other required fields based on your DTO
      }

      // Call your API to send the invite
      const response = await orderService.sendOrderInvite(inviteData)

      toast({
        title: "Invite sent!",
        description: `Ordering link has been sent to ${customerEmail}`,
      })

      // Reset form and close modal
      setOpen(false)
      setCustomerEmail("")
      setMessage("")
      setOrderLink("")
    } catch (error: any) {
      console.error("Failed to send invite:", error)

      toast({
        title: "Failed to send invite",
        description: error?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      // Only allow closing if not loading
      setOpen(false)
      // Reset form when closing
      setCustomerEmail("")
      setMessage("")
      setOrderLink("")
      setCopied(false)
    } else if (newOpen) {
      setOpen(true)
    }
  }

  return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share Ordering Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Ordering Link</DialogTitle>
            <DialogDescription>
              Send a custom ordering link to your customers so they can place orders directly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Customer Email</Label>
              <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                  id="message"
                  placeholder="Hi! Please use this link to place your order..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={isLoading}
              />
            </div>

            {!orderLink && (
                <Button
                    onClick={generateOrderLink}
                    className="w-full"
                    disabled={isLoading}
                >
                  Generate Ordering Link
                </Button>
            )}

            {orderLink && (
                <div className="space-y-2">
                  <Label>Generated Link</Label>
                  <div className="flex gap-2">
                    <Input value={orderLink} readOnly />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        disabled={isLoading}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
            )}

            <div className="flex gap-2">
              <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                  disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                  onClick={sendInvite}
                  disabled={!orderLink || isLoading}
                  className="flex-1"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                ) : (
                    "Send Invite"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}