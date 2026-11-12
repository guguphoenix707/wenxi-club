import { toLower, trim } from 'lodash-es';
import { useEffect, useState, type MouseEvent, type SubmitEvent } from 'react';
import { Button } from '@/components/common/button';
import { Form, readFormString } from '@/components/common/form';
import { Input } from '@/components/common/input';
import { PasswordInput } from '@/components/common/password-input';
import styles from './email-auth.module.css';

type EmailRegisterFormProps = {
  busy?: boolean;
  error?: string;
  onSendCode: (email: string) => void | Promise<void>;
  onSubmit: (values: { email: string; otp: string; password: string }) => void | Promise<void>;
};

export function EmailRegisterForm({
  busy = false,
  error,
  onSendCode,
  onSubmit,
}: EmailRegisterFormProps) {
  const [sending, setSending] = useState(false);
  const [hasChallenge, setHasChallenge] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const locked = busy || sending;

  useEffect(() => {
    if (!resendAt) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const handleSendCode = async (event: MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form;
    //FIXME 兼容性，namedItem reportValidity等等
    const emailInput = form?.elements.namedItem('email');
    if (!(emailInput instanceof HTMLInputElement) || !emailInput.reportValidity()) return;
    setSending(true);
    try {
      await onSendCode(toLower(trim(emailInput.value)));
      setHasChallenge(true);
      setResendAt(Date.now() + 60_000);
    } catch {
      /* FIXME 登录页会写入错误文案 */
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked) return;
    const data = new FormData(event.currentTarget);
    await onSubmit({
      email: toLower(trim(readFormString(data, 'email'))),
      otp: trim(readFormString(data, 'otp')),
      password: readFormString(data, 'password'),
    });
  };

  return (
    <>
      <h2 id="login-title">注册邮箱账号</h2>
      <p>验证邮箱并设置密码，开始你的温习</p>
      <Form
        busy={locked}
        error={error}
        onSubmit={handleSubmit}
        actions={
          <Button type="submit" size="lg" className={styles.submit} disabled={locked}>
            {locked ? '正在处理…' : '注册并进入温习社'}
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
          disabled={locked}
        />
        <Input
          name="otp"
          label="邮箱验证码"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 位验证码"
          maxLength={6}
          pattern="\d{6}"
          required
          disabled={locked}
          suffix={
            <Button
              type="button"
              variant="outline"
              disabled={remaining > 0 || locked}
              onClick={handleSendCode}
            >
              {remaining > 0 ? `${remaining} 秒后重发` : hasChallenge ? '重新获取' : '获取验证码'}
            </Button>
          }
        />
        <PasswordInput
          name="password"
          label="设置密码"
          autoComplete="new-password"
          placeholder="至少 8 位密码"
          minLength={8}
          required
          disabled={locked}
        />
      </Form>
    </>
  );
}
