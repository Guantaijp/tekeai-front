'use client';
import Link from 'next/link';
import {
  Package2,
  LayoutDashboard,
  PackagePlus,
  UserCheck,
  ClipboardList,
  MessageSquareQuote,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export function AppSidebar() {
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'dashboard';

  const iconClassName = (view: string) =>
    cn('group-data-[active=true]:text-primary');

  return (
    <Sidebar collapsible="icon" className="hidden border-r sm:flex">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">
            teke.AI
          </span>
        </Link>
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={activeView === 'dashboard'}
            tooltip="My Dashboard"
          >
            <Link href="/dashboard?view=dashboard" className="group">
              <LayoutDashboard className={iconClassName('dashboard')} />
              <span>My Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={activeView === 'new-request'}
            tooltip="New Request"
          >
            <Link href="/dashboard?view=new-request" className="group">
              <PackagePlus className={iconClassName('new-request')} />
              <span>New Request</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
              asChild
              isActive={activeView === 'my-requests'}
              tooltip="My Requests"
          >
            <Link href="/dashboard?view=my-requests" className="group">
              <MessageSquareQuote className={iconClassName('my-requests')} />
              <span>My Requests</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={activeView === 'shipment-tracking'}
            tooltip="Order Management"
          >
            <Link href="/dashboard?view=shipment-tracking" className="group">
              <ClipboardList className={iconClassName('shipment-tracking')} />
              <span>Shipment Tracking</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/*<SidebarMenuItem>*/}
        {/*  <SidebarMenuButton*/}
        {/*    asChild*/}
        {/*    isActive={activeView === 'quotes'}*/}
        {/*    tooltip="View Quotes"*/}
        {/*  >*/}
        {/*    <Link href="/dashboard?view=quotes" className="group">*/}
        {/*      <MessageSquareQuote className={iconClassName('quotes')} />*/}
        {/*      <span>View Quotes</span>*/}
        {/*    </Link>*/}
        {/*  </SidebarMenuButton>*/}
        {/*</SidebarMenuItem>*/}
        {/*<SidebarMenuItem>*/}
        {/*  <SidebarMenuButton*/}
        {/*    asChild*/}
        {/*    isActive={activeView === 'credibility-check'}*/}
        {/*    tooltip="Credibility Check"*/}
        {/*  >*/}
        {/*    <Link href="/dashboard?view=credibility-check" className="group">*/}
        {/*      <UserCheck className={iconClassName('credibility-check')} />*/}
        {/*      <span>Credibility Check</span>*/}
        {/*    </Link>*/}
        {/*  </SidebarMenuButton>*/}
        {/*</SidebarMenuItem>*/}
      </SidebarMenu>
    </Sidebar>
  );
}
