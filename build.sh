#!/bin/bash
set -e

echo "==> Building backend..."
cd /home/runner/workspace/backend
npm install
npm run build

echo "==> Building frontend..."
cd /home/runner/workspace/frontend
npm install --legacy-peer-deps
npm run build

echo "==> Build complete!"
