#!/bin/sh
set -e
git pull
docker compose --project-directory . -f ./docker-compose/docker-compose.prod.yml pull
docker compose --project-directory . -f ./docker-compose/docker-compose.prod.yml up -d
