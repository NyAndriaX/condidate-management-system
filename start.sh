#!/bin/bash

# Start MongoDB
mkdir -p /home/runner/data/mongodb
mongod --dbpath /home/runner/data/mongodb --bind_ip 127.0.0.1 --port 27017 --fork --logpath /home/runner/data/mongodb/mongod.log
echo "MongoDB started"

# Start Backend
cd /home/runner/workspace/backend
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Wait for backend to be ready
sleep 5

# Start Frontend
cd /home/runner/workspace/frontend
HOST=0.0.0.0 PORT=5000 DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
