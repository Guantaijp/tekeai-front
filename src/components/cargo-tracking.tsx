import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Truck, PackageCheck, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function CargoTracking() {
    return (
        <div className="p-4 rounded-lg grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 font-headline">Cargo Tracking</h3>
                <Card>
                    <CardContent className="p-0">
                        <Image src="https://placehold.co/800x450.png" alt="Map tracking" width={800} height={450} className="rounded-md w-full" data-ai-hint="map route" />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold mb-4 font-headline">Shipment Status</h3>
                    <Card>
                        <CardContent className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="bg-primary rounded-full p-2 text-primary-foreground"><CheckCircle className="h-5 w-5" /></div>
                                <div className="h-full w-px bg-border my-2"></div>
                            </div>
                            <div>
                                <p className="font-semibold">Picked Up</p>
                                <p className="text-sm text-muted-foreground">June 10, 2024, 9:00 AM</p>
                            </div>
                        </div>
                            <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="bg-primary rounded-full p-2 text-primary-foreground"><Truck className="h-5 w-5" /></div>
                                <div className="h-full w-px bg-border my-2 opacity-50"></div>
                            </div>
                            <div>
                                <p className="font-semibold">In Transit</p>
                                <p className="text-sm text-muted-foreground">Currently near Denver, CO</p>
                            </div>
                        </div>
                        <div className="flex gap-4 opacity-50">
                                <div className="flex flex-col items-center">
                                <div className="bg-secondary rounded-full p-2 text-secondary-foreground"><PackageCheck className="h-5 w-5" /></div>
                            </div>
                            <div>
                                <p className="font-semibold">Delivered</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                 </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-4 font-headline">Transporter Details</h3>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src="https://placehold.co/48x48.png" data-ai-hint="person face" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">John Doe</p>
                                    <p className="text-sm text-muted-foreground">Driver ID: D-12345</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="font-semibold text-sm">Vehicle Details</p>
                                <div className="text-sm text-muted-foreground">
                                    <p>Volvo VNL 760</p>
                                    <p>License: XYZ-789</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    )
}
