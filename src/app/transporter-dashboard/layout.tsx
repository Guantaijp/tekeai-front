import { Header } from '@/components/layout/header';
import { TransporterSidebar } from '@/components/layout/transporter-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Suspense } from 'react';

export default function TransporterDashboardLayout({
                                                     children,
                                                   }: {
  children: React.ReactNode
}) {
  return (
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <Suspense fallback={<div className="w-64 border-r bg-background" />}>
            <TransporterSidebar />
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