from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    title = models.CharField(max_length=200)
    target_date = models.DateTimeField()
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, blank=True, default='General')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date']

    def __str__(self):
        return f"{self.title} ({self.target_date}) - {self.owner.username}"
