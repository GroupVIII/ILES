#logs/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import BaseModel
from core.models import BaseModel
from accounts.models import User
import os

