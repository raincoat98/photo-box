#!/bin/bash

MODE=${1:-prod}

if [ "$MODE" = "dev" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
else
  COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🚀 Starting in $MODE mode ($COMPOSE_FILE)"

docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

docker network rm photo-network 2>/dev/null || true
docker network create photo-network

if [ "$MODE" = "dev" ]; then
  docker-compose -f $COMPOSE_FILE up
else
  docker-compose -f $COMPOSE_FILE up -d --build --force-recreate
fi
