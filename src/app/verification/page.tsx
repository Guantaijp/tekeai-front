"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package2, Upload, FileText, Image, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { authService } from "@/index" // Import authService (you may need to create a verification service)

interface UploadedFile {
    file: File
    preview?: string
    uploaded: boolean
}

export default function VerificationPage() {
    const router = useRouter()
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Customer documents
    const [taxId, setTaxId] = useState<UploadedFile | null>(null)
    const [companyRegCert, setCompanyRegCert] = useState<UploadedFile | null>(null)

    // Transporter documents
    const [idCopy, setIdCopy] = useState<UploadedFile | null>(null)
    const [passportPhoto, setPassportPhoto] = useState<UploadedFile | null>(null)

    useEffect(() => {
        // Get user role from localStorage
        const role = localStorage.getItem('userRole')
        if (!role) {
            router.push('/login')
            return
        }
        setUserRole(role)
    }, [router])

    const handleFileUpload = (
        file: File,
        setFileState: React.Dispatch<React.SetStateAction<UploadedFile | null>>
    ) => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB")
            return
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            setError("Only PDF, JPEG, JPG, and PNG files are allowed")
            return
        }

        // Create preview for images
        let preview: string | undefined
        if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file)
        }

        setFileState({
            file,
            preview,
            uploaded: false
        })

        setError(null)
    }

    const handleSubmitVerification = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            const userId = localStorage.getItem('userId')

            if (!userId) {
                throw new Error("User ID not found")
            }

            formData.append('userId', userId)
            formData.append('userRole', userRole || '')

            if (userRole === 'customer') {
                if (!taxId || !companyRegCert) {
                    throw new Error("Please upload all required documents")
                }
                formData.append('taxId', taxId.file)
                formData.append('companyRegCert', companyRegCert.file)
            } else if (userRole === 'transporter') {
                if (!idCopy || !passportPhoto) {
                    throw new Error("Please upload all required documents")
                }
                formData.append('idCopy', idCopy.file)
                formData.append('passportPhoto', passportPhoto.file)
            }

            // You'll need to create this API endpoint
            const response = await fetch('/api/verification/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error('Verification upload failed')
            }

            const data = await response.json()
            setSuccess("Documents uploaded successfully! Redirecting to dashboard...")

            // Mark files as uploaded
            if (userRole === 'customer') {
                setTaxId(prev => prev ? { ...prev, uploaded: true } : null)
                setCompanyRegCert(prev => prev ? { ...prev, uploaded: true } : null)
            } else if (userRole === 'transporter') {
                setIdCopy(prev => prev ? { ...prev, uploaded: true } : null)
                setPassportPhoto(prev => prev ? { ...prev, uploaded: true } : null)
            }

            // Redirect after successful upload
            setTimeout(() => {
                switch (userRole) {
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
            }, 2000)

        } catch (err: any) {
            setError(err.message || "Verification failed. Please try again.")
            console.error("Verification error:", err)
        } finally {
            setLoading(false)
        }
    }

    const FileUploadComponent = ({
                                     label,
                                     accept,
                                     file,
                                     onFileChange,
                                     description
                                 }: {
        label: string
        accept: string
        file: UploadedFile | null
        onFileChange: (file: File) => void
        description?: string
    }) => (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                        const selectedFile = e.target.files?.[0]
                        if (selectedFile) {
                            onFileChange(selectedFile)
                        }
                    }}
                    className="hidden"
                    id={`upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label
                    htmlFor={`upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
                >
                    <Upload className="h-4 w-4" />
                    Choose File
                </Label>
                {file && (
                    <div className="flex items-center gap-2 text-sm">
                        {file.file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                        ) : (
                            <FileText className="h-4 w-4" />
                        )}
                        <span className="truncate max-w-32">{file.file.name}</span>
                        {file.uploaded && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                )}
            </div>
            {file?.preview && (
                <div className="mt-2">
                    <img
                        src={file.preview}
                        alt="Preview"
                        className="max-w-32 max-h-32 object-cover rounded border"
                    />
                </div>
            )}
        </div>
    )

    const renderDocumentFields = () => {
        if (userRole === 'customer') {
            return (
                <>
                    <FileUploadComponent
                        label="Tax ID Document"
                        accept=".pdf,.jpg,.jpeg,.png"
                        file={taxId}
                        onFileChange={(file) => handleFileUpload(file, setTaxId)}
                        description="Upload your company's tax identification document (PDF, JPG, PNG)"
                    />
                    <FileUploadComponent
                        label="Company Registration Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        file={companyRegCert}
                        onFileChange={(file) => handleFileUpload(file, setCompanyRegCert)}
                        description="Upload your company registration certificate (PDF, JPG, PNG)"
                    />
                </>
            )
        } else if (userRole === 'transporter') {
            return (
                <>
                    <FileUploadComponent
                        label="ID Copy"
                        accept=".pdf,.jpg,.jpeg,.png"
                        file={idCopy}
                        onFileChange={(file) => handleFileUpload(file, setIdCopy)}
                        description="Upload a clear copy of your national ID (PDF, JPG, PNG)"
                    />
                    <FileUploadComponent
                        label="Passport Photo"
                        accept=".jpg,.jpeg,.png"
                        file={passportPhoto}
                        onFileChange={(file) => handleFileUpload(file, setPassportPhoto)}
                        description="Upload a recent passport-sized photograph (JPG, PNG)"
                    />
                </>
            )
        }
        return null
    }

    const canSubmit = () => {
        if (userRole === 'customer') {
            return taxId && companyRegCert
        } else if (userRole === 'transporter') {
            return idCopy && passportPhoto
        }
        return false
    }

    if (!userRole) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted py-12">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmitVerification}>
                    <CardHeader className="text-center">
                        <Link href="/" className="flex items-center justify-center mb-4" prefetch={false}>
                            <Package2 className="h-8 w-8 text-primary" />
                        </Link>
                        <CardTitle className="text-2xl font-headline">Document Verification</CardTitle>
                        <CardDescription>
                            Upload the required documents to complete your {userRole} registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Alert>
                            <AlertDescription>
                                {userRole === 'customer'
                                    ? "Please upload your Tax ID and Company Registration Certificate to verify your business."
                                    : "Please upload your ID copy and a recent passport photo to verify your identity."
                                }
                            </AlertDescription>
                        </Alert>

                        {renderDocumentFields()}

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardHeader className="pt-0">
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={loading || !canSubmit()}
                        >
                            {loading ? "Uploading Documents..." : "Submit for Verification"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Your documents will be reviewed within 24-48 hours
                        </div>
                    </CardHeader>
                </form>
            </Card>
        </div>
    )
}