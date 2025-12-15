import { TransporterDashboard } from '@/components/transporter-dashboard';

export default async function TransporterDashboardPage({
                                                         searchParams,
                                                       }: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return <TransporterDashboard activeView={view} />;
}
