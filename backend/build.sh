#!/usr/bin/env bash
set -o errexit

# 1. Install Python requirements FIRST
pip install -r requirements.txt

# 2. Build the frontend
cd ../frontend
npm install
npm run build

# 3. Create the templates directory
mkdir -p ../backend/templates

# 4. Copy the index.html and static files
# Copy the compiled index.html where Django expects it
cp dist/index.html ../backend/templates/
# Copy the rest of the build files to static
cp -r dist/* ../backend/staticfiles/

cd ../backend

# 5. Finalize Django setup
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py createsuperuser --noinput || true