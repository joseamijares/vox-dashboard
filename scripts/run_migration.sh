#!/bin/bash
set -e

cd "$(dirname "$0")/.."

export DATABASE_URL="postgresql://postgres:***@acela.proxy.rlwy.net:35577/railway"
export SUPABASE_KEY="$(grep SUPABASE_KEY ~/dev/vox-python/.env | cut -d= -f2)"

python3 scripts/migrate_to_railway.py
