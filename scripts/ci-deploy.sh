#!/usr/bin/env bash
# 把当前构建结果同步到一台服务器并重启。SSH_HOST、SSH_USER、SSH_KEY 由 GitHub Secrets 注入。
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${SSH_KEY:?SSH_KEY is required}"
if [ -z "${SSH_PORT:-}" ]; then
  SSH_PORT=22
fi
DEPLOY_PATH="${DEPLOY_PATH:-/srv/wenxi-club}"

umask 077
mkdir -p ~/.ssh
printf '%s\n' "$SSH_KEY" > ~/.ssh/wenxi_deploy
chmod 600 ~/.ssh/wenxi_deploy

ssh_opts=(-i "$HOME/.ssh/wenxi_deploy" -p "$SSH_PORT" -o StrictHostKeyChecking=accept-new)
if [ -n "${SSH_KNOWN_HOSTS:-}" ]; then
  printf '%s\n' "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
  ssh_opts+=(-o StrictHostKeyChecking=yes)
fi

ssh "${ssh_opts[@]}" "${SSH_USER}@${SSH_HOST}" "mkdir -p '${DEPLOY_PATH}'"

rsync -az --delete \
  --filter 'protect backend/.env' \
  --include '**/.env.example' \
  --exclude '**/.env' \
  --exclude '**/.env.*' \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.DS_Store' \
  -e "ssh ${ssh_opts[*]}" \
  ./ "${SSH_USER}@${SSH_HOST}:${DEPLOY_PATH}/"

ssh "${ssh_opts[@]}" "${SSH_USER}@${SSH_HOST}" "DEPLOY_PATH='${DEPLOY_PATH}' bash '${DEPLOY_PATH}/deploy/remote-publish.sh'"
