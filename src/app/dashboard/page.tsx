import { Dashboard } from '@/components/dashboard';

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { view: string };
}) {
  return (
    <Dashboard activeView={searchParams.view} />
  );
}
