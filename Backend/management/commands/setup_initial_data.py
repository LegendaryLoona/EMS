from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        if User.objects.filter(username='admin').exists():
            User.objects.filter(username='admin').delete()
            self.stdout.write(self.style.SUCCESS('Existing admin user deleted.'))
        
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        
        if hasattr(admin, 'role'):
            admin.role = 'admin'
            admin.save()
            
        self.stdout.write(self.style.SUCCESS('Superuser created with role="admin"!'))