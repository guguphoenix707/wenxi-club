#!/usr/bin/env bash
# 由 remote-publish.sh 通过免密 sudo 调用。只做切换站点配置和重启服务。
set -euo pipefail

cp /srv/wenxi-club/deploy/nginx.conf /etc/nginx/sites-available/wenxi.conf
ln -sfn /etc/nginx/sites-available/wenxi.conf /etc/nginx/sites-enabled/wenxi.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart wenxi-api

ready=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:3001/api/health >/dev/null; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "API 启动后健康检查失败" >&2
  exit 1
fi

systemctl reload nginx
