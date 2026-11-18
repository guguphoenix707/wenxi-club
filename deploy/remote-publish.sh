#!/usr/bin/env bash
# 在服务器上安装生产依赖并迁移，再交给 root 脚本切换 Nginx 和 API。
set -euo pipefail

cd "${DEPLOY_PATH:-/srv/wenxi-club}"

npm ci --omit=dev
npm run db:migrate
sudo -n /usr/bin/bash /srv/wenxi-club/deploy/activate.sh
