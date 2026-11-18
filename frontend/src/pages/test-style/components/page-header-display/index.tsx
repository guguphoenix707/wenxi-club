import { useState } from 'react';
import { Button } from '@/components/common/button';
import { PageHeader } from '@/components/common/page-header';
import styles from '../button-display/button-display.module.css';

export function PageHeaderDisplay() {
  const [feedback, setFeedback] = useState('这里的操作仅用于展示，不修改业务数据。');

  return (
    <div className={styles.showcase}>
      <PageHeader title="页头展示" subtitle="COMPONENTS / PAGE HEADER" bottom="左侧三层文字使用默认样式；右侧接收按钮、状态等内容，窄屏自动换行。" />
      <section className={styles.section}>
        <h2>完整配置</h2>
        <div className={styles.panel}>
          <PageHeader
            title="专注温习"
            subtitle="FOCUS MODE"
            bottom="先在脑中回答，再诚实选择熟悉程度。"
            right={<Button variant="outline" onClick={() => setFeedback('已点击右侧操作。')}>查看练习说明</Button>}
          />
        </div>
      </section>
      <section className={styles.section}>
        <h2>只传必填项</h2>
        <div className={styles.panel}><PageHeader title="今日总览" /></div>
      </section>
      <section className={styles.section}>
        <h2>自定义底部与多个右侧操作</h2>
        <div className={styles.panel}>
          <PageHeader
            title="学习统计"
            subtitle="LEARNING REPORT"
            bottom={<span>回看自己的练习记录，<strong>关注真实进步</strong>。</span>}
            right={<><Button variant="outline" onClick={() => setFeedback('已点击筛选示例。')}>筛选</Button><Button onClick={() => setFeedback('已点击导出示例，未导出实际数据。')}>导出记录</Button></>}
          />
        </div>
      </section>
      <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
    </div>
  );
}
