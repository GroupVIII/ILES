#!/usr/bin/env bash
set -o errexit

# 1. Install Python dependencies first!
pip install -r requirements.txt

# 2. Build frontend
cd ../frontend
npm install
npm run build
cd ../backend

# 3. Now collect static and migrate
python manage.py collectstatic --no-input
python manage.py migrate