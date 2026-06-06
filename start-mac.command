#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/弹珠姻缘"

cd "$APP_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Please install Node.js first:"
  echo "https://nodejs.org/"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting marble CP dev server..."
echo "Open http://localhost:3000"
npm run dev
