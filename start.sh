#!/bin/sh
set -e

# Railway assigns PORT dynamically
PORT=${PORT:-3000}
HOSTNAME=${HOSTNAME:-"0.0.0.0"}

echo "=== VOX Dashboard Startup ==="
echo "PORT: $PORT"
echo "HOSTNAME: $HOSTNAME"
echo "NODE_ENV: $NODE_ENV"
echo "PWD: $(pwd)"
echo "Files: $(ls -la)"
echo "=============================="

exec node server.js