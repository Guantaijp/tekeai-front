import { Dashboard } from '@/components/dashboard';

export default async function DashboardPage({
                                              searchParams,
                                            }: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;

  return <Dashboard activeView={view} />;
}
