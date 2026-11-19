import { useState } from 'react';
import { Form } from '@/components/common/form';
import { Input } from '@/components/common/input';
import { PasswordInput } from '@/components/common/password-input';
import { Button } from '@/components/common/button';
import styles from '../button-display/button-display.module.css';
import inputStyles from './index.module.css';
import cx from 'classnames';
export function InputDisplay() {
  const [feedback, setFeedback] = useState('填写并提交查看表单反馈。');

  return (
    <div className={styles.showcase}>
      <header>
        <p className={styles.eyebrow}>COMPONENTS / INPUT</p>
        <h1>输入框展示</h1>
        <p className={styles.intro}>复用项目公共 Input、Password Input 和 Form。包装 shadcn Input，不改 ui 源文件。</p>
      </header>
      <section className={styles.section} aria-labelledby="input-states-title">
        <h2 id="input-states-title">标签、提示与错误</h2>
        <div className={cx(styles.panel, inputStyles.inputList)}>
          <Input name="demo-email" label="邮箱地址" type="email" placeholder="请输入你的邮箱" hint="用于登录和接收验证码" />
          <PasswordInput name="demo-password" label="密码" placeholder="至少 8 位密码" />
          <Input name="demo-error" label="验证码" defaultValue="12" error="请输入 6 位验证码" />
        </div>
      </section>
      <section className={styles.section} aria-labelledby="input-form-title">
        <h2 id="input-form-title">原生 Form</h2>
        <p>提交时读取 FormData，不使用 react-hook-form。</p>
        <Form
          className={styles.panel}
          actions={<Button type="submit">查看填写内容</Button>}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const title = String(data.get('demo-title') ?? '');
            setFeedback(title.trim() ? `已读取标题：${title}` : '标题为空。');
          }}
        >
          <Input name="demo-title" label="标题" placeholder="例如：二叉树遍历" />
        </Form>
      </section>
      <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    </div>
  );
}
