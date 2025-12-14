"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Truck, Ship, MapPin, Shield, Menu, X } from "lucide-react"
import { useState } from "react"

interface DashboardLayoutProps {
    children: React.ReactNode
}

const navigationItems = [
    {
        title: "My Dashboard",
        icon: LayoutDashboard,
        href: "/",
        active: false,
    },
    {
        title: "Order Management",
        icon: Package,
        href: "/orders",
        active: true,
    },
    {
        title: "Request Transport",
        icon: Truck,
        href: "/transport",
        active: false,
    },
    {
        title: "My Shipments",
        icon: Ship,
        href: "/shipments",
        active: false,
    },
    {
        title: "Track Shipment",
        icon: MapPin,
        href: "/track",
        active: false,
    },
    {
        title: "Credibility Check",
        icon: Shield,
        href: "/credibility",
        active: false,
    },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo/Brand */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">T</span>
                            </div>
                            <span className="font-heading font-semibold text-sidebar-foreground">kasi</span>
                        </div>
                        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        item.active
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </a>
                            )
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">U</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sidebar-foreground truncate">User Account</p>
                                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 lg:px-8">
                    <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    )
}
