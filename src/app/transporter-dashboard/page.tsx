import { TransporterDashboard } from '@/components/transporter-dashboard';

export default function TransporterDashboardPage({
  searchParams,
}: {
  searchParams: { view: string };
}) {
  return (
    <TransporterDashboard activeView={searchParams.view} />
  );
}
