"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button" // Adjusted import path
import { MoreHorizontal, PlusCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Adjusted import path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { userService } from "@/index" // Import userService
import type { User, UserRole, UserStatus } from "@/types/api" // Import User and related types

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await userService.getAllUsers()
            // console.log(response.data.data.users)
            setUsers(response.data.data.users)
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch users.")
            console.error("Error fetching users:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const getStatusVariant = (
        status: UserStatus,
    ): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status) {
            case "active":
                return "outline"
            case "inactive":
                return "destructive" // Assuming 'suspended' maps to 'inactive'
            case "pending":
                return "secondary"
            default:
                return "secondary"
        }
    }

    const getRoleVariant = (role: UserRole): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (role) {
            case "customer":
                return "secondary"
            case "transporter":
                return "default"
            case "admin":
                return "default" // Admins can also be 'default' or a specific variant
            default:
                return "secondary"
        }
    }

    const handleSuspendUser = async (userId: string, currentStatus: UserStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus === "active" ? "suspended" : "activate"} this user?`)) return
        const newStatus: UserStatus = currentStatus === "active" ? "suspended" : "active" // Toggle status
        try {
            await userService.updateUserStatus(userId, { status: newStatus })
            fetchUsers() // Re-fetch users to update the table
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${newStatus === "inactive" ? "suspended" : "activate"} user.`)
            console.error("Error updating user status:", err)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Loading users...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10">Loading users...</div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Error loading users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-red-500">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">User Management</CardTitle>
                    <CardDescription>View and manage all users on the platform.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={`/placeholder.svg?height=32&width=32&query=${user.name.replace(/\s/g, "%20")}`}
                                                    alt={`${user.name}'s avatar`}
                                                />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {/*<DropdownMenuItem onClick={() => console.log(`View profile for ${user.name}`)}>*/}
                                                {/*    View Profile*/}
                                                {/*</DropdownMenuItem>*/}
                                                {/*<DropdownMenuItem onClick={() => console.log(`Edit user ${user.name}`)}>*/}
                                                {/*    Edit User*/}
                                                {/*</DropdownMenuItem>*/}
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleSuspendUser(user.id, user.status)}
                                                >
                                                    {user.status === "active" ? "Suspend User" : "Activate User"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{users.length}</strong> users
                </div>
            </CardFooter>
        </Card>
    )
}
