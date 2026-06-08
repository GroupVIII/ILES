#!/usr/bin/env bash
set -o errexit

# Build frontend
cd ../frontend
npm install
npm run build

# Copy build files to a directory Django knows
# Assuming your React build output is in 'dist'
cp -r dist/* ../backend/staticfiles/
# Ensure index.html is also in the root of staticfiles for the TemplateView
cp dist/index.html ../backend/staticfiles/

cd ../backend

# Collect static files
python manage.py collectstatic --no-input
python manage.py migrate