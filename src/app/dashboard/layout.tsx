import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Suspense } from 'react';

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode
}) {
  return (
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <Suspense fallback={<div className="w-64 border-r bg-background" />}>
            <AppSidebar />
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