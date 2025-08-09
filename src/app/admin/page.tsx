import { AdminDashboard } from '@/components/admin-dashboard';

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { view: string };
}) {
  return (
    <AdminDashboard activeView={searchParams.view} />
  );
}
