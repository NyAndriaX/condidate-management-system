#!/bin/bash

# Start Backend
cd /home/runner/workspace/backend
npm run dev &
echo "Backend started"

# Wait for backend to be ready
sleep 5

# Start Frontend
cd /home/runner/workspace/frontend
HOST=0.0.0.0 PORT=5000 DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
