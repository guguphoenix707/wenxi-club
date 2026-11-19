import type { ReactNode } from 'react';
import './page-header.css';

export type PageHeaderProps = {
  /** 页面主标题。 */
  title: ReactNode;
  /** 主标题上方的小标题，例如 FOCUS MODE。 */
  subtitle?: ReactNode;
  /** 主标题下方的说明或补充内容。 */
  bottom?: ReactNode;
  /** 右侧按钮、状态或其他操作内容。 */
  right?: ReactNode;
};

export function PageHeader({ title, subtitle, bottom, right }: PageHeaderProps) {
  return (
    <header className="bread-page-header">
      <div className="bread-page-header-left">
        <div className="bread-page-header-subtitle">{subtitle}</div>
        <h1 className="bread-page-header-title">{title}</h1>
        {bottom != null && bottom !== false && <div className="bread-page-header-bottom">{bottom}</div>}
      </div>
      {right != null && right !== false && <div className="bread-page-header-right">{right}</div>}
    </header>
  );
}
