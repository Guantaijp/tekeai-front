'use client';
import { TransporterDashboardOverview } from '@/components/transporter-dashboard-overview';
import { MyJobs } from '@/components/my-jobs';
import {BrowseRequests, TransporterJobs} from '@/components/browse-requests';
import { MyFleet } from './my-fleet';
import { RoutePlanner } from './route-planner';


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
      case 'dashboard':
      default:
        return <TransporterDashboardOverview />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}
