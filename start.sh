#!/bin/sh
set -e

COMPOSE="docker compose --project-directory . -f ./docker-compose/docker-compose.prod.yml"

git pull
$COMPOSE pull

# force-recreate: compose reuses a running container when only .env changed,
# so without it edited variables silently do not reach the app
$COMPOSE up -d --force-recreate backend
