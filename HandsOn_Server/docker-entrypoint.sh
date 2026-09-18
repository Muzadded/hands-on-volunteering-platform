#!/bin/sh
set -e

echo "Waiting for database..."
retries=30
until node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.end()).catch((e) => { console.error(e.message); process.exit(1); });
" 2>/dev/null; do
  retries=$((retries - 1))
  if [ "$retries" -le 0 ]; then
    echo "Database not ready"
    exit 1
  fi
  sleep 2
done

echo "Running migrations..."
npm run migrate

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding demo data..."
  npm run seed || true
fi

echo "Starting API..."
exec npx tsx server.js
