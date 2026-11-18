import type { ComponentType } from 'react';
import { ButtonDisplay } from './components/button-display';
import { InputDisplay } from './components/input-display';
import { PageHeaderDisplay } from './components/page-header-display';

export type StyleDemo = {
  id: string;
  label: string;
  Component: ComponentType;
};

/** 组件示例目录。新增 demo 时在这里登记，页面会生成对应跳转。 */
export const styleDemos: StyleDemo[] = [
  { id: 'button', label: 'button', Component: ButtonDisplay },
  { id: 'input', label: 'input', Component: InputDisplay },
  { id: 'page-header', label: 'page-header', Component: PageHeaderDisplay },
];
