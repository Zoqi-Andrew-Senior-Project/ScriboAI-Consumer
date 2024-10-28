#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker build -t consumer-frontend $SCRIPT_DIR/consumer_frontend
docker build -t consumer-backend $SCRIPT_DIR/consumer_backend

docker compose down
docker compose up -d
