#!/usr/bin/env bash
set -o errexit

# Install Python dependencies first!
pip install -r requirements.txt

# Build frontend
cd ../frontend
npm install
npm run build

# Copy build files to a directory Django knows
cp -r dist/* ../backend/staticfiles/
cp dist/index.html ../backend/templates/ 

cd ../backend

# Collect static files
python manage.py collectstatic --no-input
python manage.py migrate