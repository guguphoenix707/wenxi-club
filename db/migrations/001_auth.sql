CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  email text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  avatar_url text,
  status varchar(16) NOT NULL DEFAULT 'active',
  wechat_unionid text,
  wechat_platform_id text,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_status_check CHECK (status IN ('active', 'disabled')),
  CONSTRAINT users_wechat_pair_check CHECK (
    (wechat_unionid IS NULL AND wechat_platform_id IS NULL)
    OR (wechat_unionid IS NOT NULL AND wechat_platform_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX users_email_uk ON users (email);
CREATE UNIQUE INDEX users_wechat_identity_uk
  ON users (wechat_platform_id, wechat_unionid)
  WHERE wechat_unionid IS NOT NULL AND wechat_platform_id IS NOT NULL;

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX auth_sessions_token_uk ON auth_sessions (token);
CREATE INDEX auth_sessions_user_id_idx ON auth_sessions (user_id);

CREATE TABLE auth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX auth_accounts_provider_account_uk
  ON auth_accounts (provider_id, account_id);
CREATE INDEX auth_accounts_user_id_idx ON auth_accounts (user_id);

CREATE TABLE auth_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_verifications_identifier_idx ON auth_verifications (identifier);
