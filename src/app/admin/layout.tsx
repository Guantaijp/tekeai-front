import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Suspense } from 'react';

export default function AdminDashboardLayout({
                                               children,
                                             }: {
  children: React.ReactNode
}) {
  return (
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <Suspense fallback={<div className="w-64 border-r bg-background" />}>
            <AdminSidebar />
          </Suspense>
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
  )
}