#!/usr/bin/env bash
set -o errexit

# 1. Build React
cd ../frontend
npm install
npm run build

# 2. Copy the build output to a place Django can see
# 'dist' is the standard output folder for Vite
# We copy everything to backend/staticfiles
cp -r dist/* ../backend/staticfiles/

# 3. CRITICAL: Ensure index.html is also in the root of templates
# if you used a 'templates' folder instead
cp dist/index.html ../backend/staticfiles/

cd ../backend

# 4. Collect static files
python manage.py collectstatic --no-input
python manage.py migrate