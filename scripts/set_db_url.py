#!/usr/bin/env python3
import os

# Read password from file
with open('/tmp/.pgpass') as f:
    pwd = f.read().strip()

# Set the DATABASE_URL env var in Railway
url = f"postgresql://postgres:{pwd}@postgres-flpd.railway.internal:5432/railway"
print(f"Setting DATABASE_URL...")

# Use railway CLI to set the variable
os.system(f'railway variables --service d0648087-06b9-49d7-aada-556cc29f1fcd --set "DATABASE_URL={url}"')
print("Done")
