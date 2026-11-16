import {useEffect, useId, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {Brand} from '@/components/common/brand';
import {Button} from '@/components/common/button';
import {EmailLoginForm} from '@/features/auth/email-login-form';
import {EmailRegisterForm} from '@/features/auth/email-register-form';
import {
  getBrowserSession,
  getLoginMethods,
  registerWithEmail,
  sendEmailOtp,
  signInWithEmail,
  startWeChatSignIn,
} from '@/lib/api/auth';
import {
  loadWxLogin,
  mountWxLogin,
  parseWeChatAuthorizationUrl,
  type WeChatAuthorization,
} from '@/features/auth/wechat-qr';
import styles from './login.module.css';

type Screen = 'loading' | 'unconfigured' | 'form' | 'entering';
type EmailMode = 'login' | 'register';
type Method = 'email' | 'wechat';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrId = `wechat-login-${useId().replaceAll(':', '')}`;
  const [screen, setScreen] = useState<Screen>('loading');
  const [method, setMethod] = useState<Method>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('login');
  const [wechatEnabled, setWechatEnabled] = useState(false);
  const [message, setMessage] = useState(
    searchParams.get('error') ? '登录未完成，请重新扫码' : '',
  );
  const [busy, setBusy] = useState(false);
  const [authorization, setAuthorization] = useState<WeChatAuthorization | null>(null);
  const [wechatGeneration, setWechatGeneration] = useState(0);
  const [wechatError, setWechatError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setScreen('loading');
      try {
        const methods = await getLoginMethods();
        if (cancelled) return;
        if (!methods.ok) {
          setScreen('unconfigured');
          setMessage(methods.error.message);
          return;
        }
        const session = await getBrowserSession();
        if (cancelled) return;
        if (!session.ok) {
          setScreen('unconfigured');
          setMessage(session.error.message);
          return;
        }
        if (session.data?.user) {
          setScreen('entering');
          await navigate('/', {replace: true});
          return;
        }
        setWechatEnabled(methods.data.wechat);
        setScreen('form');
      } catch (error) {
        if (cancelled) return;
        setScreen('unconfigured');
        setMessage(error instanceof Error ? error.message : '登录服务暂时不可用');
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (screen !== 'form' || method !== 'wechat' || !wechatEnabled) return;
    let cancelled = false;

    async function loadQr() {
      setAuthorization(null);
      setWechatError('');
      try {
        const result = await startWeChatSignIn();
        if (!result.ok) {
          if (!cancelled) setWechatError(result.error.message);
          return;
        }
        const nextAuthorization = parseWeChatAuthorizationUrl(result.data);
        if (cancelled) return;
        setAuthorization(nextAuthorization);
      } catch (error) {
        if (cancelled) return;
        setWechatError(error instanceof Error ? error.message : '登录二维码加载失败');
      }
    }

    loadQr();
    return () => {
      cancelled = true;
    };
  }, [method, screen, wechatEnabled, wechatGeneration]);

  useEffect(() => {
    if (method !== 'wechat' || !authorization) return;
    let cancelled = false;
    void loadWxLogin()
      .then(() => {
        if (!cancelled) mountWxLogin(qrId, authorization);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setWechatError(error instanceof Error ? error.message : '微信登录脚本加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [authorization, method, qrId]);

  async function enterAfterAuth() {
    setScreen('entering');
    await navigate('/', {replace: true});
  }

  async function handleLogin(values: { email: string; password: string }) {
    setBusy(true);
    setMessage('');
    try {
      const result = await signInWithEmail(values);
      if (!result.ok) {
        setMessage(result.error.message);
        return;
      }
      await enterAfterAuth();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(values: { email: string; otp: string; password: string }) {
    setBusy(true);
    setMessage('');
    try {
      const result = await registerWithEmail(values);
      if (!result.ok) {
        setMessage(result.error.message);
        return;
      }
      await enterAfterAuth();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '注册失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  }

  async function handleSendCode(email: string) {
    setMessage('');
    try {
      const result = await sendEmailOtp(email);
      if (!result.ok) {
        setMessage(result.error.message);
        return false;
      }
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '验证码发送失败，请稍后重试');
      return false;
    }
  }

  if (screen === 'loading' || screen === 'entering') {
    return <main className={styles.loading}>{screen === 'entering' ? '正在进入温习社…' : '正在加载温习社…'}</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <Brand to="/login" className={styles.brand}/>
        <div>
          <span className={styles.tag}>每天一点，把模糊变熟悉</span>
          <h1>学过的知识，<br/>值得再见一面。</h1>
          <p>用记忆卡片收集所学，跟随温习节奏，<br/>让每一次回顾，都离熟知更近一步。</p>
          <div className={styles.cards}><span>收集灵感 ✦</span><span>温习一下 ↗</span><span>把知识留住 ✓</span></div>
        </div>
        <small>不必一次记住所有，今天也可以慢慢来。</small>
      </section>
      <section className={styles.panel} aria-labelledby="login-title">
        <span className={styles.tag}>很高兴见到你</span>
        {screen === 'unconfigured' ? (
          <>
            <h2 id="login-title">暂时无法登录</h2>
            <p className={styles.message} role="alert">{message}</p>
          </>
        ) : method === 'wechat' ? (
          <>
            <h2 id="login-title">微信扫码，开始温习</h2>
            <p>首次登录将自动创建账号，无需单独注册</p>
            {authorization && !wechatError ? (
              <>
                <div id={qrId} className={styles.qr} aria-label="微信登录二维码"/>
                <div className={styles.status} role="status">请使用微信扫一扫</div>
                <button className={styles.refresh} type="button"
                        onClick={() => setWechatGeneration((value) => value + 1)}>↻ 刷新二维码
                </button>
                <p className={styles.mobile}>手机访问？截图保存二维码 → 切换微信 → 从相册识别 → 返回浏览器。</p>
                {message ? <p className={styles.message} role="status">{message}</p> : null}
              </>
            ) : (
              <>
                <p className={styles.message} role="alert">{wechatError || '正在加载微信登录…'}</p>
                {wechatError ? (
                  <button className={styles.retry} type="button"
                          onClick={() => setWechatGeneration((value) => value + 1)}>重新尝试</button>
                ) : null}
              </>
            )}
            <Button type="button" variant="link" className={styles.methodLink} onClick={() => setMethod('email')}>
              返回邮箱登录
            </Button>
          </>
        ) : (
          <>
            {emailMode === 'login' ? (
              <EmailLoginForm busy={busy} error={message} onSubmit={handleLogin}/>
            ) : (
              <EmailRegisterForm
                busy={busy}
                error={message}
                onSendCode={handleSendCode}
                onSubmit={handleRegister}
              />
            )}
            <Button
              type="button"
              variant="link"
              className={styles.methodLink}
              disabled={busy}
              onClick={() => {
                setEmailMode(emailMode === 'login' ? 'register' : 'login');
                setMessage('');
              }}
            >
              {emailMode === 'login' ? '还没有账号？注册' : '已有账号？去登录'}
            </Button>
            {wechatEnabled ? (
              <Button
                type="button"
                variant="link"
                className={styles.methodLink}
                disabled={busy}
                onClick={() => {
                  setMethod('wechat');
                  setMessage('');
                }}
              >
                其他方式 · 微信登录
              </Button>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
