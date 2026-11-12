import { useEffect } from 'react';
import { NavLink, matchPath, useLocation } from 'react-router';
import { Brand } from '@/components/common/brand';
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import '@/components/common/sidebar/sidebar.css';

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
  const { setOpenMobile, open } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return (
    <Sidebar className={open ? 'bread-sidebar' : 'bread-sidebar bread-sidebar-collapsed'} collapsible="icon">
      <SidebarHeader className="bread-sidebar-header">
        <Brand to="/" size="sm" className="bread-sidebar-brand" subtitle="把模糊变熟悉" />
        <SidebarTrigger
          className="bread-sidebar-toggle"
          aria-label={open ? '收起侧边栏' : '展开侧边栏'}
          aria-expanded={open}
          title={open ? '收起侧边栏' : '展开侧边栏'}
        />
        <button type="button" className="bread-sidebar-close" onClick={() => setOpenMobile(false)} aria-label="关闭导航菜单">
          ×
        </button>
      </SidebarHeader>
      <SidebarContent className="bread-sidebar-content">
        <SidebarGroup className="bread-sidebar-group">
          <SidebarGroupContent>
            <nav aria-label="主导航">
              <SidebarMenu className="bread-sidebar-menu">
                {navigationItems.map(item => {
                  const active = Boolean(matchPath({ path: item.to, end: true }, location.pathname));
                  return (
                    <SidebarMenuItem className="bread-sidebar-menu-item" key={item.to}>
                      <SidebarMenuButton
                        className={active ? 'bread-sidebar-item bread-sidebar-item-active' : 'bread-sidebar-item'}
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
      <SidebarFooter className="bread-sidebar-footer">
        {/*FIXME*/}
        <p className="bread-sidebar-note">待定</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileHeader() {
  const { pathname } = useLocation();
  const { openMobile } = useSidebar();

  return (
    <header className="bread-mobile-header">
      <SidebarTrigger
        className="bread-mobile-menu"
        aria-label={openMobile ? '收起侧边栏' : '展开侧边栏'}
        aria-expanded={openMobile}
        title={openMobile ? '收起侧边栏' : '展开侧边栏'}
      />
      <Brand to="/" size="sm" className="bread-mobile-title" subtitle={currentNavLabel(pathname)} />
    </header>
  );
}
