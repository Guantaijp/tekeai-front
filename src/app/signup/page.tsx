"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Package2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authService } from "@/index" // Import authService
import type { UserRole } from "@/types/api" // Import UserRole type

export default function SignupPage() {
    const router = useRouter()
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<UserRole>("customer") // Use UserRole type
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await authService.register({
                name: fullname,
                email,
                password,
                role,
            })

            setSuccess(response.data.message || "Registration successful!")
            // In a real app, you'd save the token (response.data.data.token) and user info
            // localStorage.setItem('authToken', response.data.data.token);
            // localStorage.setItem('userRole', response.data.data.user.role);

            // Redirect based on the selected role or the role returned by the backend
            switch (response.data.data.user.role) {
                case "customer":
                    router.push("/dashboard")
                    break
                case "transporter":
                    router.push("/transporter-dashboard")
                    break
                case "admin":
                    router.push("/admin")
                    break
                default:
                    router.push("/dashboard")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.")
            console.error("Signup error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted py-12">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSignup}>
                    <CardHeader className="text-center">
                        <Link href="/" className="flex items-center justify-center mb-4" prefetch={false}>
                            <Package2 className="h-8 w-8 text-primary" />
                        </Link>
                        <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
                        <CardDescription>Join teke.AI and start shipping or transporting today.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                placeholder="John Doe"
                                required
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 ">
                            <Label>I am a...</Label>
                            <RadioGroup
                                defaultValue="customer"
                                onValueChange={(value: UserRole) => setRole(value)}
                                className="flex gap-4 pt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="customer" id="customer" />
                                    <Label htmlFor="customer">Customer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="transporter" id="transporter" />
                                    <Label htmlFor="transporter">Transporter</Label>
                                </div>
                                {/*<div className="flex items-center space-x-2">*/}
                                {/*    <RadioGroupItem value="admin" id="admin" />*/}
                                {/*    <Label htmlFor="admin">Admin</Label>*/}
                                {/*</div>*/}
                            </RadioGroup>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Signing Up..." : "Sign Up"}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline" prefetch={false}>
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
