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
import { Share2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ShareOrderingLinkModal() {
  const [open, setOpen] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")
  const [message, setMessage] = useState("")
  const [orderLink, setOrderLink] = useState("")
  const [copied, setCopied] = useState(false)
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

    try {
      // Here you would call your API to send the invite
      // await orderService.sendOrderInvite({ customerEmail, message })

      toast({
        title: "Invite sent!",
        description: `Ordering link has been sent to ${customerEmail}`,
      })

      setOpen(false)
      setCustomerEmail("")
      setMessage("")
      setOrderLink("")
    } catch (error) {
      toast({
        title: "Failed to send invite",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
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
              />
            </div>

            {!orderLink && (
                <Button onClick={generateOrderLink} className="w-full">
                  Generate Ordering Link
                </Button>
            )}

            {orderLink && (
                <div className="space-y-2">
                  <Label>Generated Link</Label>
                  <div className="flex gap-2">
                    <Input value={orderLink} readOnly />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={sendInvite} disabled={!orderLink} className="flex-1">
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}
