'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const links = [['/', '今日总览'], ['/review', '开始温习'], ['/questions/new', '添加题目'], ['/import', '批量导入'], ['/stats', '学习统计']] as const;

export function AppShell({children}: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="shell"><a className="skip-link" href="#main">跳到内容</a>
    <aside><Link href="/" className="brand">面试温习社<small>把模糊变熟悉</small></Link>
      <nav aria-label="主导航">{links.map(([href, label]) => <Link key={href} href={href}
                                                                   aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}</nav>
      <p className="note">生产项目 · 初始化阶段</p></aside>
    <main id="main">{children}</main>
  </div>;
}
