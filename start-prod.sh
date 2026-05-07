#!/bin/bash
set -e

echo "==> Starting MongoDB..."
mkdir -p /home/runner/data/mongodb
mongod --dbpath /home/runner/data/mongodb --bind_ip 127.0.0.1 --port 27017 \
  --fork --logpath /home/runner/data/mongodb/mongod.log
echo "MongoDB started"

echo "==> Starting Backend..."
cd /home/runner/workspace/backend
node dist/index.js &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

echo "==> Waiting for backend..."
sleep 5

echo "==> Starting Frontend..."
cd /home/runner/workspace/frontend
npx serve -s build -l 5000
