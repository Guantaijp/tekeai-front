import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle } from "lucide-react";

const quotes = [
    { id: 1, requestId: 'SH4829', item: 'Vintage Arcade Machine', transporter: 'Speedy Logistics', price: 2800, rating: 4.9, reviews: 124, avatar: 'https://placehold.co/40x40.png' },
    { id: 2, requestId: 'SH4829', item: 'Vintage Arcade Machine', transporter: 'Reliable Movers', price: 3100, rating: 4.8, reviews: 88, avatar: 'https://placehold.co/40x40.png' },
    { id: 3, requestId: 'SH4829', item: 'Vintage Arcade Machine', transporter: 'Cross-Country Haul', price: 2650, rating: 4.7, reviews: 210, avatar: 'https://placehold.co/40x40.png' },
];

export function QuotesManagement() {
    // In a real app, you'd group quotes by request ID.
    // For this example, we'll just show them all for one request.
    const request = {
        id: 'SH4829',
        item: 'Vintage Arcade Machine'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quote Management</CardTitle>
                <CardDescription>Review and accept quotes from transporters for your active requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold font-headline">{request.item} <span className="text-sm text-muted-foreground font-normal">#{request.id}</span></h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        {quotes.map(quote => (
                            <Card key={quote.id} className="flex flex-col bg-card">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={quote.avatar} data-ai-hint="logo transport" />
                                            <AvatarFallback>{quote.transporter.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base font-headline">{quote.transporter}</CardTitle>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Star className="w-4 h-4 fill-accent text-accent" />
                                                <span>{quote.rating} ({quote.reviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-3xl font-bold text-center">${quote.price.toLocaleString()}</p>
                                </CardContent>
                                <CardFooter className="flex-col gap-2">
                                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Accept Quote
                                    </Button>
                                    <Button variant="ghost" className="w-full">View Profile</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
                {/* You could add more request sections here */}
            </CardContent>
        </Card>
    );
}
