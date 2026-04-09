from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Restored the secret key to fix the ImproperlyConfigured error
SECRET_KEY = 'django-insecure-x1c8f60-6#i9)q8*yc$3s5dwm!@5mc(#a%5$g1u=_*%uue3$x)'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Updated to allow local development connections
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']


# Application definition
INSTALLED_APPS = [
    'corsheaders',            # Required for React-to-Django communication
    'rest_framework',         # Required for your API views
    'rest_framework_simplejwt', # Required for your Token logic
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',                   # Your main ILES app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database - Using your PostgreSQL configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'iles_db',
        'USER': 'joshuassenyonjo',
        'PASSWORD': '130595/095',
        'HOST': '',      
        'PORT': '5432',
    }
}

# Identity & Access Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Custom User Model definition
AUTH_USER_MODEL = "core.CustomUser"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# CORS Configuration - Allows your React frontend to talk to this backend
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]