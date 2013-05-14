from django.contrib import auth
from django.db import models

# Create your models here.
class Log(models.Model):
  user = models.ForeignKey('auth.User') 
  added = models.DateTimeField(auto_now_add=True)
  log = models.CharField(max_length=200)
