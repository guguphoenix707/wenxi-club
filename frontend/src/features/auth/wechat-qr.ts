import {
  LOGIN_CONTAINER_MISSING_MESSAGE,
  WECHAT_AUTH_PARAMS_INCOMPLETE_MESSAGE,
  WECHAT_AUTH_URL_INVALID_MESSAGE,
  WECHAT_SCRIPT_FAILED_MESSAGE,
  WECHAT_SCRIPT_UNAVAILABLE_MESSAGE,
} from '@/constants/error-messages';

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
    throw new Error(WECHAT_AUTH_URL_INVALID_MESSAGE);
  }
  const appid = url.searchParams.get('appid');
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');
  const scope = url.searchParams.get('scope') || 'snsapi_login';
  if (!appid || !redirectUri || !state) throw new Error(WECHAT_AUTH_PARAMS_INCOMPLETE_MESSAGE);
  return { appid, redirectUri, state, scope };
}

export function loadWxLogin() {
  if (window.WxLogin) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(WECHAT_SCRIPT_FAILED_MESSAGE)), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(WECHAT_SCRIPT_FAILED_MESSAGE));
    document.head.appendChild(script);
  });
}

export function mountWxLogin(containerId: string, authorization: WeChatAuthorization) {
  const WxLogin = window.WxLogin;
  if (!WxLogin) throw new Error(WECHAT_SCRIPT_UNAVAILABLE_MESSAGE);
  const container = document.getElementById(containerId);
  if (!container) throw new Error(LOGIN_CONTAINER_MISSING_MESSAGE);
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
