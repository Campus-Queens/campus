import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_backend.settings')
django.setup()

from appuser.models import AppUser

# Create superuser if it doesn't exist
if not AppUser.objects.filter(email='admin@queensu.ca').exists():
    AppUser.objects.create_superuser(
        email='admin@queensu.ca',
        password='admin123',
        name='Admin User',
        username='admin',
        bio='Admin user',
        location='Kingston',
        year=1
    )
    print('Superuser created successfully!')
else:
    print('Superuser already exists!') 