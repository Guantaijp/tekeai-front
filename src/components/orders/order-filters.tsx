"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { OrderStatus } from "./order-status-badge"

interface OrderFiltersProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: OrderStatus | "all") => void
  onClearFilters: () => void
  disabled?: boolean
}

export function OrderFilters({ onSearch, onStatusFilter, onClearFilters, disabled = false }: OrderFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    onStatusFilter(status as OrderStatus | "all")
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    onClearFilters()
  }

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Received", label: "Received" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Dispatch", label: "Dispatch" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Sent", label: "Sent" },
  ]

  return (
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              disabled={disabled}
          />
        </div>

        <Select value={selectedStatus} onValueChange={handleStatusFilter} disabled={disabled}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(searchQuery || selectedStatus !== "all") && (
            <Button variant="outline" onClick={handleClearFilters} disabled={disabled} className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Clear
            </Button>
        )}
      </div>
  )
}
