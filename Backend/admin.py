from django.contrib import admin
from .models import Department, CustomUser, Employee, Attendance, Task
# Register your models here.

admin.site.register(Department)
admin.site.register(CustomUser)
admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(Task)