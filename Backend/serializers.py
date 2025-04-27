# serializers.py
from rest_framework import serializers
from .models import Department, CustomUser, Employee, Attendance, Task, Request
from django.contrib.auth import get_user_model
from django.db.models import Sum


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    total_salary = serializers.SerializerMethodField()
    class Meta:
        model = Department
        fields = '__all__'
    def get_employee_count(self, obj):
        return Employee.objects.filter(department=obj).count()

    def get_total_salary(self, obj):
        total = Employee.objects.filter(department=obj).aggregate(total=Sum('salary'))['total']
        return total or 0.00



User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password',
            'first_name', 'last_name', 'role',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')  # No KeyError now
        role = validated_data.get('role')
        user = User(**validated_data)
        user.set_password(password)
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
        else:
            user.is_staff = False
            user.is_superuser = False
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:  # Only set if provided
            instance.set_password(password)

        instance.save()
        return instance


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    manager_name = serializers.ReadOnlyField(source='manager.first_name', read_only=True)
    manager_email = serializers.SerializerMethodField()

    def get_manager_email(self, obj):
        if obj.manager and obj.manager.user:
            return obj.manager.user.email
        return None

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_id', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'address', 'hire_date',
            'manager', 'position', 'salary', 'department', 'is_active',
            'department_name', 'manager_name', 'manager_email'
        ]
        read_only_fields = ('id',)


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.first_name', read_only=True)
    hours_worked = serializers.ReadOnlyField()
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ('id',)

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.first_name')
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.first_name')

    class Meta:
        model = Task
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = '__all__'

    def get_submitted_by_name(self, obj):
        return f"{obj.submitted_by.first_name} {obj.submitted_by.last_name}"