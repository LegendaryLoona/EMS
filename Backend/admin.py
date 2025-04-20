from django.contrib import admin
from .models import Department, CustomUser, Employee, Attendance, LeaveType, LeaveRequest, Document
# Register your models here.

admin.site.register(Department)
admin.site.register(CustomUser)
admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(LeaveType)
admin.site.register(LeaveRequest)
admin.site.register(Document)