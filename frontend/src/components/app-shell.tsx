import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { AppSidebar, MobileHeader } from './app-sidebar';
import { Loading } from './loading';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/components/common/shell/shell.css';

export function AppShell() {
  return (
    <TooltipProvider>
      <SidebarProvider className="bread-shell">
        <a className="bread-skip-link" href="#main">跳到内容</a>
        <AppSidebar />
        <SidebarInset id="main" className="bread-main">
          <MobileHeader />
          <div className="bread-page">
            <Suspense fallback={<Loading />}><Outlet /></Suspense>
          </div>
        </SidebarInset>
        <ScrollRestoration />
      </SidebarProvider>
    </TooltipProvider>
  );
}
