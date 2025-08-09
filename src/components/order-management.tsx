import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CargoTracking } from "./cargo-tracking";
import { ProofOfDelivery } from "./proof-of-delivery";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const shipments = [
    { id: 'SH4829', item: 'Vintage Arcade Machine', status: 'Finding Transporter' },
    { id: 'SH9310', item: 'Office Supplies', status: 'In Transit' },
    { id: 'SH1776', item: 'Custom Glassware', status: 'Delivered' },
];

export function OrderManagement() {
    const getStatusVariant = (status: string): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
        switch (status) {
            case 'Finding Transporter': return 'secondary';
            case 'Awaiting Acceptance': return 'secondary';
            case 'In Transit': return 'default';
            case 'Delivered': return 'outline';
            default: return 'default';
        }
    };

    const renderContent = (status: string) => {
        switch (status) {
            case 'Finding Transporter':
                return (
                    <div className="p-4 text-center flex items-center justify-center text-muted-foreground">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       <p>Searching for an available transporter...</p>
                    </div>
                )
             case 'Awaiting Acceptance':
                return (
                    <div className="p-4 text-center">
                        <p className="mb-2 text-muted-foreground">Waiting for transporter to accept the job.</p>
                    </div>
                )
            case 'In Transit':
                return <CargoTracking />;
            case 'Delivered':
                return <ProofOfDelivery />;
            default:
                return null;
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Order Management</CardTitle>
                <CardDescription>Track your requests and see delivery confirmations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue="item-SH4829">
                    {shipments.map(shipment => (
                        <AccordionItem value={`item-${shipment.id}`} key={shipment.id}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4 items-center">
                                    <div>
                                        <span className="font-medium font-headline">{shipment.item}</span>
                                        <span className="text-muted-foreground text-sm ml-2">#{shipment.id}</span>
                                    </div>
                                    <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-muted/30 rounded-b-md">
                               {renderContent(shipment.status)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
