import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { AppSidebar, MobileHeader } from './app-sidebar';
import { Loading } from './loading';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppShell() {
  return (
    <TooltipProvider>
      <SidebarProvider className="shell">
        <a className="skip-link" href="#main">跳到内容</a>
        <AppSidebar />
        <SidebarInset id="main">
          <MobileHeader />
          <div className="page">
            <Suspense fallback={<Loading />}><Outlet /></Suspense>
          </div>
        </SidebarInset>
        <ScrollRestoration />
      </SidebarProvider>
    </TooltipProvider>
  );
}
