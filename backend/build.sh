#!/usr/bin/env bash
set -o errexit

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build frontend
cd ../frontend
npm install
npm run build

# 3. Ensure the directories exist using -p (prevents errors if it exists)
mkdir -p ../backend/staticfiles
mkdir -p ../backend/templates

# 4. Copy build files to the correct Django locations
# Copy all assets (CSS, JS) to staticfiles
cp -r ../frontend/dist/* ../backend/staticfiles/
# Copy index.html to the templates directory
cp dist/index.html ../backend/templates/

cd ../backend

# 5. Collect static files and migrate
python manage.py collectstatic --no-input
python manage.py migrate