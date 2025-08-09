'use client';
import { RequestSubmission } from '@/components/request-submission';
import { OrderManagement } from '@/components/order-management';
import { CredibilityCheck } from '@/components/credibility-check';
import { DashboardOverview } from './dashboard-overview';
import { QuotesManagement } from './quotes-management';
import MyShipmentsPage from "@/components/my-shipments";
import ShipmentsTable from "@/app/shipments/shipments-table";
import Page from "@/app/tracking/[shipmentId]/page";

export function Dashboard({ activeView }: { activeView?: string }) {
  const renderContent = () => {
    switch (activeView) {
      case 'new-request':
        return <RequestSubmission />;
      case 'my-requests':
        return <MyShipmentsPage />;
      case 'shipment-tracking':
        return <ShipmentsTable />;
      // case 'shipment-tracking':
      //   return <Page />;
      case 'credibility-check':
        return <CredibilityCheck />;
      case 'quotes':
        return <QuotesManagement />;
      case 'dashboard':
      default:
        return <DashboardOverview />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}
