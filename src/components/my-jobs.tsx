import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CheckCircle, Upload, Loader2, MapPin } from "lucide-react";
import { shipmentService, transporterService } from "@/index";

interface UploadPodDto {
    photo: File;
    notes?: string;
    recipientName: string;
    recipientSignature?: string;
    latitude?: number;
    longitude?: number;
}

export function MyJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadingPod, setUploadingPod] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await transporterService.getTransporterJobs();
            console.log(response.data);

            // Extract jobs from the response structure
            const jobsData = response.data?.jobs || response.data.data || [];
            setJobs(jobsData);
        } catch (err: any) {
            setError('Error fetching jobs: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadPod = async (jobId: string, podData: UploadPodDto) => {
        try {
            setUploadingPod(jobId);

            // Add current location if available
            const uploadData = {
                ...podData,
                ...(currentLocation && {
                    latitude: currentLocation.lat,
                    longitude: currentLocation.lng
                })
            };

            const response = await shipmentService.uploadProofOfDelivery(jobId, uploadData);

            // Refresh jobs after successful upload
            await fetchJobs();

            console.log('Proof of delivery uploaded successfully', response.data);

            // You might want to show a success toast here
            alert('Proof of delivery uploaded successfully!');

        } catch (err: any) {
            console.error('Error uploading proof of delivery:', err);

            // Show error message
            const errorMessage = err.response?.data?.message || err.message || 'Failed to upload proof of delivery';
            alert('Error: ' + errorMessage);
        } finally {
            setUploadingPod(null);
        }
    };

    useEffect(() => {
        fetchJobs();
        getCurrentLocation(); // Get location when component mounts
    }, []);

    const getStatusVariant = (status: string): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status.toLowerCase()) {
            case 'in_transit':
            case 'accepted':
            case 'picked_up': return 'default';
            case 'delivered': return 'outline';
            case 'cancelled':
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'in_transit': return 'In Transit';
            case 'picked_up': return 'Picked Up';
            case 'accepted': return 'Accepted';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            case 'rejected': return 'Rejected';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Jobs</CardTitle>
                    <CardDescription>A history of your completed and in-progress jobs.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading jobs...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Jobs</CardTitle>
                    <CardDescription>A history of your completed and in-progress jobs.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <Button onClick={fetchJobs} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Jobs</CardTitle>
                <CardDescription>A history of your completed and in-progress jobs.</CardDescription>
            </CardHeader>
            <CardContent>
                {jobs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No jobs found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item & Tracking</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Earnings</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <p className="font-semibold">{job.itemDescription}</p>
                                            <p className="text-xs text-muted-foreground">#{job.trackingNumber}</p>
                                            <p className="text-xs text-muted-foreground">{job.weight}kg</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm"><strong>From:</strong> {job.originAddress}</p>
                                            <p className="text-sm"><strong>To:</strong> {job.destinationAddress}</p>
                                            <p className="text-xs text-muted-foreground">{parseFloat(job.distanceKm).toFixed(1)} km</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm font-medium">{job.customer.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{job.customer.user.phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(job.status)}>{getStatusLabel(job.status)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">KSh {parseFloat(job.platformFee).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        {(job.status.toLowerCase() === 'accepted' || job.status.toLowerCase() === 'picked_up' || job.status.toLowerCase() === 'in_transit') && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={uploadingPod === job.id}
                                                    >
                                                        {uploadingPod === job.id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="mr-2 h-3 w-3" />
                                                                Upload POD
                                                            </>
                                                        )}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <form onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        const formData = new FormData(e.currentTarget);
                                                        const photo = formData.get('pod-photo') as File;
                                                        const notes = formData.get('pod-notes') as string;
                                                        const recipientName = formData.get('recipient-name') as string;
                                                        const recipientSignature = formData.get('recipient-signature') as string;

                                                        if (!photo) {
                                                            alert('Please select a photo');
                                                            return;
                                                        }

                                                        if (!recipientName.trim()) {
                                                            alert('Please enter recipient name');
                                                            return;
                                                        }

                                                        await handleUploadPod(job.id, {
                                                            photo,
                                                            notes: notes || undefined,
                                                            recipientName: recipientName.trim(),
                                                            recipientSignature: recipientSignature || undefined
                                                        });
                                                    }}>
                                                        <DialogHeader>
                                                            <DialogTitle>Upload Proof of Delivery</DialogTitle>
                                                            <DialogDescription>
                                                                Submit a photo and delivery details to confirm the delivery for job #{job.trackingNumber}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="pod-photo" className="text-right">
                                                                    Photo *
                                                                </Label>
                                                                <Input
                                                                    id="pod-photo"
                                                                    name="pod-photo"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="col-span-3"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="recipient-name" className="text-right">
                                                                    Recipient *
                                                                </Label>
                                                                <Input
                                                                    id="recipient-name"
                                                                    name="recipient-name"
                                                                    placeholder="Name of person who received package"
                                                                    className="col-span-3"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="recipient-signature" className="text-right">
                                                                    Signature
                                                                </Label>
                                                                <Input
                                                                    id="recipient-signature"
                                                                    name="recipient-signature"
                                                                    placeholder="Digital signature or ID number"
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="pod-notes" className="text-right">
                                                                    Notes
                                                                </Label>
                                                                <Textarea
                                                                    id="pod-notes"
                                                                    name="pod-notes"
                                                                    placeholder="e.g., Left package at front door, Delivered to security guard"
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            {currentLocation && (
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">
                                                                        Location
                                                                    </Label>
                                                                    <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span>Current location will be recorded</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button type="button" variant="outline">Cancel</Button>
                                                            </DialogClose>
                                                            <Button
                                                                type="submit"
                                                                disabled={uploadingPod === job.id}
                                                            >
                                                                {uploadingPod === job.id ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    'Submit POD'
                                                                )}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        {job.status.toLowerCase() === 'delivered' && (
                                            <div className="flex items-center justify-end text-xs text-muted-foreground gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                <span>POD Uploaded</span>
                                            </div>
                                        )}
                                        {(job.status.toLowerCase() === 'cancelled' || job.status.toLowerCase() === 'rejected') && (
                                            <div className="flex items-center justify-end text-xs text-muted-foreground gap-1">
                                                <span>No action needed</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}