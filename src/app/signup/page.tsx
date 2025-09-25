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
    const [role, setRole] = useState<UserRole>("customer") // Use UserRole type
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Common fields
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phone, setphone] = useState("")

    // Transporter-specific fields
    const [transporterName, setTransporterName] = useState("")
    const [idNumber, setIdNumber] = useState("")

    // Customer-specific fields
    const [companyName, setCompanyName] = useState("")
    const [location, setLocation] = useState("")
    const [pin, setPin] = useState("")

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            let registrationData: any = {
                email,
                password,
                phone,
                role,
            }

            if (role === "transporter") {
                registrationData = {
                    ...registrationData,
                    name: transporterName,
                    idNumber,
                }
            } else if (role === "customer") {
                registrationData = {
                    ...registrationData,
                    name: companyName,
                    location,
                    pin,
                }
            }

            const response = await authService.register(registrationData)

            setSuccess(response.data.message || "Registration successful!")
            // In a real app, you'd save the token (response.data.data.token) and user info
            localStorage.setItem('authToken', response.data.data.token);
            localStorage.setItem('userRole', response.data.data.user.role);

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

    const renderRoleSpecificFields = () => {
        if (role === "transporter") {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="transporterName">Full Name</Label>
                        <Input
                            id="transporterName"
                            placeholder="John Doe"
                            required
                            value={transporterName}
                            onChange={(e) => setTransporterName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input
                            id="idNumber"
                            placeholder="12345678"
                            required
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                        />
                    </div>
                </>
            )
        } else if (role === "customer") {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            placeholder="ABC Company Ltd"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="Nairobi, Kenya"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pin">PIN</Label>
                        <Input
                            id="pin"
                            placeholder="P123456789A"
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                    </div>
                </>
            )
        }
        return null
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
                            <Label>I am a...</Label>
                            <RadioGroup
                                defaultValue="customer"
                                onValueChange={(value: UserRole) => setRole(value)}
                                className="flex gap-3 pt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="customer" id="customer" />
                                    <Label htmlFor="customer">Customer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="transporter" id="transporter" />
                                    <Label htmlFor="transporter">Transporter</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Role-specific fields */}
                        {renderRoleSpecificFields()}

                        {/* Common fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
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
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+254 700 123 456"
                                required
                                value={phone}
                                onChange={(e) => setphone(e.target.value)}
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