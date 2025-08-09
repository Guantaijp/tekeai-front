'use client';
import { AdminDashboardOverview } from '@/components/admin-dashboard-overview';
import { UserManagement } from './user-management';
import { ShipmentManagement } from './shipment-management';
import PricingModelPage from "@/components/pricing-model";

export function AdminDashboard({ activeView }: { activeView?: string }) {
  const renderContent = () => {
    switch (activeView) {
      case 'user-management':
        return <UserManagement />;
      case 'shipment-management':
        return <ShipmentManagement />;
        case 'pricing-model':
        return <PricingModelPage />;

      case 'dashboard':
      default:
        return <AdminDashboardOverview />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}
