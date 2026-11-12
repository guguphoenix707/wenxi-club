const SCRIPT_SRC = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';

type WxLoginCtor = new (options: {
  self_redirect: boolean;
  id: string;
  appid: string;
  scope: string;
  redirect_uri: string;
  state: string;
  style?: string;
}) => unknown;

declare global {
  interface Window {
    WxLogin?: WxLoginCtor;
  }
}

export type WeChatAuthorization = {
  appid: string;
  redirectUri: string;
  state: string;
  scope: string;
};

export function parseWeChatAuthorizationUrl(urlString: string): WeChatAuthorization {
  const url = new URL(urlString);
  if (url.hostname !== 'open.weixin.qq.com' || !url.pathname.endsWith('/connect/qrconnect')) {
    throw new Error('授权地址无效');
  }
  const appid = url.searchParams.get('appid');
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');
  const scope = url.searchParams.get('scope') || 'snsapi_login';
  if (!appid || !redirectUri || !state) throw new Error('授权参数不完整');
  return { appid, redirectUri, state, scope };
}

export function loadWxLogin() {
  if (window.WxLogin) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('微信登录脚本加载失败')), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('微信登录脚本加载失败'));
    document.head.appendChild(script);
  });
}

export function mountWxLogin(containerId: string, authorization: WeChatAuthorization) {
  const WxLogin = window.WxLogin;
  if (!WxLogin) throw new Error('微信登录脚本不可用');
  const container = document.getElementById(containerId);
  if (!container) throw new Error('登录容器不存在');
  container.replaceChildren();
  new WxLogin({
    self_redirect: false,
    id: containerId,
    appid: authorization.appid,
    scope: authorization.scope,
    redirect_uri: encodeURIComponent(authorization.redirectUri),
    state: authorization.state,
    style: 'black',
  });
}
