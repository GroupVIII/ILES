#!/usr/bin/env bash
set -o errexit

# Install Python
pip install -r requirements.txt

# Build React
cd ../frontend
npm install
npm run build

# Copy to a folder Django actually checks
mkdir -p ../backend/staticfiles
cp -r dist/* ../backend/staticfiles/
# Move index.html to a place that matches your TEMPLATES 'DIRS'
mkdir -p ../backend/templates
cp dist/index.html ../backend/templates/

cd ../backend
python manage.py collectstatic --no-input
python manage.py migrate