import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminDashboardPage({
                                                   searchParams,
                                                 }: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return <AdminDashboard activeView={view} />;
}
