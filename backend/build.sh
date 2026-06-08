#!/usr/bin/env bash
set -o errexit

# Build frontend
cd ../frontend
npm install
npm run build
cd ../backend

# Collect static files
python manage.py collectstatic --no-input
python manage.py migrate