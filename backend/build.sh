#!/usr/bin/env bash
set -o errexit

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build frontend
cd ../frontend
npm install
npm run build

# 3. Create the templates folder if it doesn't exist
mkdir -p ../backend/templates

# 4. Copy the index.html specifically to where Django looks
cp dist/index.html ../backend/templates/

# 5. Copy all other build assets to static
cp -r dist/* ../backend/staticfiles/

cd ../backend

# 6. Finalize
python manage.py collectstatic --no-input
python manage.py migrate