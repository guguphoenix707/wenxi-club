#!/usr/bin/env bash
# 在腾讯云 Ubuntu 上执行一次：sudo bash deploy/bootstrap.sh
# 安装 Node.js 24、Nginx、PostgreSQL，并写入 backend/.env。已有 .env 时不会覆盖。
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 sudo 运行：sudo bash deploy/bootstrap.sh" >&2
  exit 1
fi

deploy_user="${SUDO_USER:-$(id -un)}"
deploy_home="$(getent passwd "$deploy_user" | cut -d: -f6)"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl xz-utils nginx postgresql sudo rsync

case "$(uname -m)" in
  x86_64) node_arch=linux-x64 ;;
  aarch64) node_arch=linux-arm64 ;;
  *) echo "不支持的架构：$(uname -m)" >&2; exit 1 ;;
esac

if ! /usr/local/bin/node --version 2>/dev/null | grep -q '^v24\.'; then
  checksums="$(curl -fsSL https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt)"
  tarball="$(printf '%s\n' "$checksums" | awk -v arch="$node_arch" '$2 ~ ("node-v24\\..*-" arch "\\.tar\\.xz$") { print $2; exit }')"
  expected="$(printf '%s\n' "$checksums" | awk -v file="$tarball" '$2 == file { print $1; exit }')"
  if [ -z "$tarball" ] || [ -z "$expected" ]; then
    echo "没有找到 Node.js 24 的 ${node_arch} 安装包" >&2
    exit 1
  fi
  tmp="$(mktemp -d)"
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/${tarball}" -o "${tmp}/${tarball}"
  echo "${expected}  ${tmp}/${tarball}" | sha256sum -c -
  tar -xJf "${tmp}/${tarball}" -C /usr/local --strip-components=1
  rm -rf "$tmp"
fi

install -d -o "$deploy_user" -g "$deploy_user" -m 755 /srv/wenxi-club
if [ "$repo_root" != /srv/wenxi-club ]; then
  rsync -a --exclude '.git/' --exclude 'node_modules/' --exclude 'backend/.env' \
    "${repo_root}/" /srv/wenxi-club/
  chown -R "$deploy_user:$deploy_user" /srv/wenxi-club
fi

if [ ! -f /srv/wenxi-club/backend/.env ]; then
  db_password="$(openssl rand -hex 24)"
  auth_secret="$(openssl rand -base64 48 | tr -d '\n')"
  public_ip="$(curl -fsSL --max-time 2 http://metadata.tencentyun.com/latest/meta-data/public-ipv4 || true)"
  public_origin="http://${public_ip:-127.0.0.1}"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'wenxi') THEN
    CREATE ROLE wenxi LOGIN PASSWORD '${db_password}';
  ELSE
    ALTER ROLE wenxi WITH LOGIN PASSWORD '${db_password}';
  END IF;
END
\$\$;
SQL
  sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = 'wenxi'" | grep -q 1 \
    || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE wenxi OWNER wenxi"
  cat > /srv/wenxi-club/backend/.env <<EOF
HOST=127.0.0.1
PORT=3001
DATABASE_URL=postgres://wenxi:${db_password}@127.0.0.1:5432/wenxi
BETTER_AUTH_SECRET=${auth_secret}
BETTER_AUTH_URL=${public_origin}
WECHAT_APP_ID=
WECHAT_APP_SECRET=
EOF
  chown "$deploy_user:$deploy_user" /srv/wenxi-club/backend/.env
  chmod 600 /srv/wenxi-club/backend/.env
  echo "已写入 /srv/wenxi-club/backend/.env，浏览器地址是 ${public_origin}。换成正式域名后改 BETTER_AUTH_URL。"
fi

sed "s/__USER__/${deploy_user}/g" /srv/wenxi-club/deploy/wenxi-api.service > /etc/systemd/system/wenxi-api.service
systemctl daemon-reload
systemctl enable wenxi-api
systemctl enable --now nginx

sudoers_file="/etc/sudoers.d/wenxi-deploy"
cat > "$sudoers_file" <<EOF
${deploy_user} ALL=(root) NOPASSWD: /usr/bin/bash /srv/wenxi-club/deploy/activate.sh
EOF
chmod 440 "$sudoers_file"
visudo -cf "$sudoers_file"

install -d -o "$deploy_user" -g "$deploy_user" -m 700 "${deploy_home}/.ssh"
touch "${deploy_home}/.ssh/authorized_keys"
chown "$deploy_user:$deploy_user" "${deploy_home}/.ssh/authorized_keys"
chmod 600 "${deploy_home}/.ssh/authorized_keys"
echo "把 GitHub Actions 部署公钥写入 ${deploy_home}/.ssh/authorized_keys 后再推送。"
