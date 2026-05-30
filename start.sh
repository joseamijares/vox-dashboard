#!/bin/sh
set -e

# Railway assigns PORT dynamically
PORT=${PORT:-3000}
HOSTNAME=${HOSTNAME:-"0.0.0.0"}

echo "Starting VOX Dashboard on $HOSTNAME:$PORT"
node server.js