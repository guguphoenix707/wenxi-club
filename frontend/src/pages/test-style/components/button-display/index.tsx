import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpenCheck, LoaderCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './button-display.module.css';

const variants = [
  ['default', '主要按钮', '页面的主要操作'],
  ['secondary', '次要按钮', '与主要操作并列'],
  ['outline', '描边按钮', '取消与轻量操作'],
  ['ghost', '轻量按钮', '工具栏与辅助操作'],
  ['destructive', '危险按钮', '删除等危险操作'],
  ['link', '文字链接', '进一步了解'],
] as const;
const sizes = ['xs', 'sm', 'default', 'lg'] as const;
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;

export function ButtonDisplay() {
  const [feedback, setFeedback] = useState('点击按钮查看反馈，也可以按 Tab 检查键盘焦点。');
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  function demonstrateLoading() {
    if (timer.current !== null) return;
    setLoading(true);
    setFeedback('正在演示加载状态…');
    timer.current = setTimeout(() => {
      timer.current = null;
      setLoading(false);
      setFeedback('加载演示完成，可以再次体验。');
    }, 1500);
  }
  const announce = (name: string) => setFeedback(`已点击「${name}」示例。`);

  return <div className={styles.showcase}>
    <header>
      <p className="eyebrow">COMPONENTS / BUTTON</p>
      <h1>按钮展示</h1>
      <p className={styles.intro}>复用项目公共 Button 和产品主题。所有操作仅用于展示，不修改业务数据。</p>
    </header>
    <section className={styles.section} aria-labelledby="variants-title">
      <h2 id="variants-title">变体与状态</h2>
      <p>悬停查看颜色变化，按 Tab 聚焦、按 Enter 或空格触发；禁用与加载示例不可操作。</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th scope="col">变体 / 用途</th><th scope="col">可交互</th><th scope="col">禁用</th><th scope="col">加载中</th></tr></thead>
          <tbody>{variants.map(([variant, label, usage]) => <tr key={variant}>
            <th scope="row"><code>{variant}</code><small>{usage}</small></th>
            <td><Button type="button" variant={variant} onClick={() => announce(label)}>{label}</Button></td>
            <td><Button type="button" variant={variant} disabled>{label}</Button></td>
            <td><Button type="button" variant={variant} disabled aria-busy="true"><LoaderCircle className={styles.spinner} aria-hidden="true" />处理中</Button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="sizes-title">
      <h2 id="sizes-title">尺寸</h2>
      <div className={styles.panel}>{sizes.map(size => <div key={size} className={styles.example}>
        <Button type="button" size={size} onClick={() => announce(`${size} 尺寸`)}>开始温习</Button><code>{size}</code>
      </div>)}</div>
    </section>
    <section className={styles.section} aria-labelledby="icons-title">
      <h2 id="icons-title">图标与组合</h2>
      <p>纯图标按钮提供可访问名称；文字按钮的图标作为装饰。</p>
      <div className={styles.panel}>{iconSizes.map(size => <div key={size} className={styles.example}>
        <Button type="button" size={size} variant="outline" aria-label={`添加题目，${size}`} onClick={() => announce(`添加题目，${size}`)}><Plus aria-hidden="true" /></Button><code>{size}</code>
      </div>)}</div>
      <div className={styles.panel}>
        <Button type="button" onClick={() => announce('开始温习')}><BookOpenCheck data-icon="inline-start" aria-hidden="true" />开始温习</Button>
        <Button type="button" variant="outline" onClick={() => announce('下一步')}>下一步<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="loading-title">
      <h2 id="loading-title">体验加载流程</h2>
      <p>点击后模拟 1.5 秒等待，期间禁用按钮，完成后恢复。仅演示界面状态。</p>
      <div className={styles.panel}>
        <Button type="button" disabled={loading} aria-busy={loading} onClick={demonstrateLoading}>
          {loading ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {loading ? '正在添加…' : '模拟添加题目'}
        </Button>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="usage-title">
      <h2 id="usage-title">调用示例</h2>
      <pre className={styles.code}><code>{`import { Button } from '@/components/ui/button';

<Button type="button" onClick={handleClick}>开始温习</Button>
<Button type="button" variant="outline" size="sm">取消</Button>
<Button type="button" variant="destructive" disabled>删除</Button>
<Button type="button" size="icon" aria-label="添加题目">
  <Plus aria-hidden="true" />
</Button>`}</code></pre>
    </section>
    <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
  </div>;
}
