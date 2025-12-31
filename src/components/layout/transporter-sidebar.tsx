'use client';
import Link from 'next/link';
import {
  Package2,
  LayoutDashboard,
  Search,
  ClipboardList,
  Truck,
  Map,
  Wallet,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export function TransporterSidebar() {
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'dashboard';

  const iconClassName = (view: string) =>
      cn('group-data-[active=true]:text-primary');

  return (
      <Sidebar collapsible="icon" className="hidden border-r sm:flex">
        <SidebarHeader>
          <Link href="/transporter-dashboard" className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">
            kasi
          </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'dashboard'}
                  tooltip="My Dashboard"
              >
                <Link href="/transporter-dashboard?view=dashboard" className="group">
                  <LayoutDashboard className={iconClassName('dashboard')} />
                  <span>My Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'browse-requests'}
                  tooltip="Browse Requests"
              >
                <Link href="/transporter-dashboard?view=browse-requests" className="group">
                  <Search className={iconClassName('browse-requests')} />
                  <span>Browse Requests</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'order-management'}
                  tooltip="Order Management"
              >
                <Link href="/transporter-dashboard?view=order-management" className="group">
                  <ClipboardList className={iconClassName('order-management')} />
                  <span>Completed Jobs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'route-planner'}
                  tooltip="My Route Planner"
              >
                <Link href="/transporter-dashboard?view=route-planner" className="group">
                  <Map className={iconClassName('route-planner')} />
                  <span>My Route Planner</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'my-fleet'}
                  tooltip="Manage My Fleet"
              >
                <Link href="/transporter-dashboard?view=my-fleet" className="group">
                  <Truck className={iconClassName('my-fleet')} />
                  <span>Manage My Fleet</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'payouts'}
                  tooltip="Payouts"
              >
                <Link href="/transporter-dashboard?view=payouts" className="group">
                  <Wallet className={iconClassName('payouts')} />
                  <span>My Earnings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  isActive={activeView === 'profile'}
                  tooltip="Profile"
              >
                <Link href="/transporter-dashboard?view=profile" className="group">
                  <User className={iconClassName('profile')} />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  );
}