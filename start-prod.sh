#!/bin/bash
set -e

echo "==> Starting Backend..."
cd /home/runner/workspace/backend
node dist/index.js &
echo "Backend started"

echo "==> Waiting for backend..."
sleep 5

echo "==> Starting Frontend..."
cd /home/runner/workspace/frontend
npx serve -s build -l 5000
