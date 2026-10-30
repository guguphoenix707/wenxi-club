import { useEffect } from 'react';
import { Link, NavLink, matchPath, useLocation } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

export const navigationItems = [
  { to: '/', label: '今日总览' },
  { to: '/review', label: '开始温习' },
  { to: '/questions/new', label: '添加题目' },
  { to: '/import', label: '批量导入' },
  { to: '/stats', label: '学习统计' },
] as const;

function currentNavLabel(pathname: string) {
  return navigationItems.find(item => matchPath({ path: item.to, end: true }, pathname))?.label ?? '页面不存在';
}

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return (
    <Sidebar className="app-sidebar" collapsible="offcanvas">
      <SidebarHeader className="app-sidebar-header">
        <Link to="/" className="brand">
          温习社
          <small>把模糊变熟悉</small>
        </Link>
        <button type="button" className="sidebar-close" onClick={() => setOpenMobile(false)} aria-label="关闭导航菜单">
          ×
        </button>
      </SidebarHeader>
      <SidebarContent className="app-sidebar-content">
        <SidebarGroup className="app-sidebar-group">
          <SidebarGroupContent>
            <nav aria-label="主导航">
              <SidebarMenu>
                {navigationItems.map(item => {
                  const active = Boolean(matchPath({ path: item.to, end: true }, location.pathname));
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        render={<NavLink to={item.to} end>{item.label}</NavLink>}
                        isActive={active}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="app-sidebar-footer">
        {/*FIXME*/}
        <p className="note">待定</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileHeader() {
  const { pathname } = useLocation();

  return (
    <header className="mobile-header">
      <SidebarTrigger className="mobile-menu-button" aria-label="打开导航菜单" />
      <div className="mobile-header-title">
        <strong>温习社</strong>
        <small>{currentNavLabel(pathname)}</small>
      </div>
    </header>
  );
}
