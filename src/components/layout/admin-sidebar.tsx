'use client';

import Link from 'next/link';
import {
  Package2,
  LayoutDashboard,
  Users,
  Settings,
  Package,
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

export function AdminSidebar() {
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'dashboard';

  const iconClassName = (view: string) =>
    cn('group-data-[active=true]:text-primary');

  return (
    <Sidebar collapsible="icon" className="hidden border-r sm:flex">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">
            kasi
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
            <Link href="/admin?view=dashboard" className="group">
              <LayoutDashboard className={iconClassName('dashboard')} />
              <span>My Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={activeView === 'user-management'}
            tooltip="User Management"
          >
            <Link href="/admin?view=user-management" className="group">
              <Users className={iconClassName('user-management')} />
              <span>Users</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={activeView === 'shipment-management'}
            tooltip="Shipment Management"
          >
            <Link href="/admin?view=shipment-management" className="group">
              <Package className={iconClassName('shipment-management')} />
              <span>Shipments</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
              asChild
              isActive={activeView === 'pricing-model'}
              tooltip="Pricing"
          >
            <Link href="/admin?view=pricing-model" className="group">
              <Package className={iconClassName('pricing-model')} />
              <span>Pricing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/*<SidebarMenuItem>*/}
        {/*  <SidebarMenuButton*/}
        {/*    asChild*/}
        {/*    isActive={activeView === 'settings'}*/}
        {/*    tooltip="Settings"*/}
        {/*  >*/}
        {/*    <Link href="/admin?view=settings" className="group">*/}
        {/*      <Settings className={iconClassName('settings')} />*/}
        {/*      <span>Settings</span>*/}
        {/*    </Link>*/}
        {/*  </SidebarMenuButton>*/}
        {/*</SidebarMenuItem>*/}
      </SidebarMenu>
    </Sidebar>
  );
}
