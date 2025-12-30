'use client'

import { TransporterDashboardOverview } from '@/components/transporter-dashboard-overview';
import { MyJobs } from '@/components/my-jobs';
import { TransporterJobs } from '@/components/browse-requests';
import { MyFleet } from './my-fleet';
import { RoutePlanner } from './route-planner';
import ProfilePage from "@/app/profile/page";
import PayoutsPage from "@/app/payouts/page";


export function TransporterDashboard({ activeView }: { activeView?: string }) {
  const renderContent = () => {
    switch (activeView) {
      case 'browse-requests':
        return <TransporterJobs />;
      case 'order-management':
        return <MyJobs />;
      case 'route-planner':
        return <RoutePlanner />;
      case 'my-fleet':
        return <MyFleet />;
      case 'payouts':
        return <PayoutsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'dashboard':
      default:
        return <TransporterDashboardOverview />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}