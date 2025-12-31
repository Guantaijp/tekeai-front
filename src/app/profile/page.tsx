'use client';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Camera, Save, Bell, Shield, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Sample user data - replace with actual data from your backend
    const [userData, setUserData] = useState({
        firstName: 'John',
        lastName: 'Mutua',
        email: 'john.mutua@example.com',
        phone: '+254 712 345 678',
        company: 'Swift Transport Ltd',
        licenseNumber: 'KBY-123X',
        vehicleType: 'truck',
    });

    const [notifications, setNotifications] = useState({
        newOrders: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });

    const handleSaveProfile = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast({
            title: 'Profile updated',
            description: 'Your profile has been successfully updated.',
        });
    };

    const handleSaveNotifications = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        toast({
            title: 'Settings saved',
            description: 'Your notification preferences have been updated.',
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="w-full">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="/placeholder-avatar.jpg" />
                                    <AvatarFallback className="text-2xl">
                                        {userData.firstName[0]}
                                        {userData.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <Camera className="mr-2 h-4 w-4" />
                                        Change Photo
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or GIF. Max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={userData.firstName}
                                        onChange={(e) =>
                                            setUserData({ ...userData, firstName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={userData.lastName}
                                        onChange={(e) =>
                                            setUserData({ ...userData, lastName: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) =>
                                        setUserData({ ...userData, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={userData.phone}
                                    onChange={(e) =>
                                        setUserData({ ...userData, phone: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input
                                    id="company"
                                    value={userData.company}
                                    onChange={(e) =>
                                        setUserData({ ...userData, company: e.target.value })
                                    }
                                />
                            </div>

                            <Button onClick={handleSaveProfile} disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                <CardTitle>Notifications</CardTitle>
                            </div>
                            <CardDescription>
                                Choose what notifications you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="newOrders" className="font-medium">
                                        New Order Alerts
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when new orders are available
                                    </p>
                                </div>
                                <Switch
                                    id="newOrders"
                                    checked={notifications.newOrders}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, newOrders: checked })
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="orderUpdates" className="font-medium">
                                        Order Updates
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Updates on your accepted orders
                                    </p>
                                </div>
                                <Switch
                                    id="orderUpdates"
                                    checked={notifications.orderUpdates}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, orderUpdates: checked })
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="promotions" className="font-medium">
                                        Promotions & Offers
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Special deals and promotional offers
                                    </p>
                                </div>
                                <Switch
                                    id="promotions"
                                    checked={notifications.promotions}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, promotions: checked })
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="newsletter" className="font-medium">
                                        Newsletter
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Monthly newsletter with tips and updates
                                    </p>
                                </div>
                                <Switch
                                    id="newsletter"
                                    checked={notifications.newsletter}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, newsletter: checked })
                                    }
                                />
                            </div>

                            <Button onClick={handleSaveNotifications} disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Saving...' : 'Save Preferences'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}