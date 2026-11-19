export type WeChatProfileInput = {
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
  openid?: string;
};

export function mapWeChatProfileToUser(profile: WeChatProfileInput, platformId: string) {
  const unionid = profile.unionid?.trim();
  return {
    name: profile.nickname?.trim() || '微信用户',
    image: profile.headimgurl?.trim() || undefined,
    emailVerified: false as const,
    ...(unionid ? { wechatUnionid: unionid, wechatPlatformId: platformId } : {}),
  };
}
