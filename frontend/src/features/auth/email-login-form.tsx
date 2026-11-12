import { toLower, trim } from 'lodash-es';
import type { FormEvent } from 'react';
import { Button } from '@/components/common/button';
import { Form, readFormString } from '@/components/common/form';
import { Input } from '@/components/common/input';
import { PasswordInput } from '@/components/common/password-input';
import styles from './email-auth.module.css';

type EmailLoginFormProps = {
  busy?: boolean;
  error?: string;
  onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
};

export function EmailLoginForm({ busy = false, error, onSubmit }: EmailLoginFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    await onSubmit({
      email: toLower(trim(readFormString(data, 'email'))),
      password: readFormString(data, 'password'),
    });
  };

  return (
    <>
      <h2 id="login-title">邮箱密码登录</h2>
      <p>欢迎回来，继续把模糊变熟悉</p>
      <Form
        busy={busy}
        error={error}
        onSubmit={handleSubmit}
        actions={
          <Button type="submit" size="lg" className={styles.submit} disabled={busy}>
            {busy ? '正在处理…' : '登录'}
          </Button>
        }
      >
        <Input
          name="email"
          label="邮箱地址"
          type="email"
          autoComplete="username"
          placeholder="请输入你的邮箱"
          required
          disabled={busy}
        />
        <PasswordInput
          name="password"
          label="密码"
          autoComplete="current-password"
          placeholder="请输入密码"
          required
          disabled={busy}
        />
      </Form>
    </>
  );
}
