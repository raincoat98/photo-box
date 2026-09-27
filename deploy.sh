#!/usr/bin/env bash

set -euo pipefail

MODE="${1:-prod}"

case "$MODE" in
  dev)
    COMPOSE_FILE="docker-compose.dev.yml"
    ;;
  prod)
    COMPOSE_FILE="docker-compose.prod.yml"
    ;;
  *)
    echo "Usage: $0 [dev|prod]" >&2
    exit 1
    ;;
esac

COMPOSE=(
  docker compose
  --env-file backend/.env
  --env-file frontend/.env
  -f "$COMPOSE_FILE"
)

echo "Starting $MODE mode with $COMPOSE_FILE"

if [ "$MODE" = "dev" ]; then
  "${COMPOSE[@]}" up --build --remove-orphans
else
  "${COMPOSE[@]}" up -d --build --remove-orphans
  "${COMPOSE[@]}" ps
fi
