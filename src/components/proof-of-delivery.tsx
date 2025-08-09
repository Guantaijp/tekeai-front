import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, NotebookText } from "lucide-react";

export function ProofOfDelivery() {
    return (
        <div className="p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 font-headline">Proof of Delivery</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-headline">Delivery Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Image src="https://placehold.co/600x400.png" alt="Delivered package" width={600} height={400} className="rounded-b-md w-full" data-ai-hint="package delivered" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><CheckCircle className="text-green-500" />Successfully Delivered</CardTitle>
                        <CardDescription>Your shipment has reached its destination.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-start gap-2">
                             <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                             <div>
                                <p className="font-semibold text-sm">Delivered on</p>
                                <span className="text-sm text-muted-foreground">June 15, 2024, 2:30 PM</span>
                             </div>
                         </div>
                         <div className="flex items-start gap-2">
                             <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                <p className="font-semibold text-sm">Delivery address</p>
                                <span className="text-sm text-muted-foreground">123 Main St, Anytown, USA</span>
                             </div>
                         </div>
                         <div className="flex items-start gap-2">
                             <NotebookText className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                <p className="font-semibold text-sm">Transporter's Notes</p>
                                <span className="text-sm text-muted-foreground italic">"Left package at the front porch behind the pillar as requested."</span>
                             </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
