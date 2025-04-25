# views.py
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Department, Employee
from .serializers import CustomUserSerializer
from .serializers import DepartmentSerializer, CustomUserSerializer, EmployeeSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Attendance, Employee
from .serializers import AttendanceSerializer
from django.utils import timezone

class MarkAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        employee_id = request.data.get('employee_id')
        action = request.data.get('action')

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        today = timezone.now().date()
        attendance, created = Attendance.objects.get_or_create(employee=employee, date=today)

        if action == 'clock_in':
            attendance.clock_in = timezone.now()
        elif action == 'clock_out':
            attendance.clock_out = timezone.now()
        else:
            return Response({'error': 'Invalid action'}, status=400)

        attendance.save()
        return Response(AttendanceSerializer(attendance).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    employee = Employee.objects.select_related('department').get(user=request.user)
    serializer = EmployeeSerializer(employee)
    return Response(serializer.data)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            })
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_employees(request, department_id):
    employees = Employee.objects.filter(department__id=department_id).select_related('user')
    data = []
    for emp in employees:
        data.append({
            'id': emp.id,
            'first_name': emp.first_name,
            'last_name': emp.last_name,
            'position': emp.position,
            'salary': emp.salary,
            'user_email': emp.user.email,
        })
    return Response(data)



class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


# Simple test view to verify authentication
class TestAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_role = request.user.role
        return Response({
            'message': f'You are authenticated as {user_role}',
            'user_id': request.user.id,
            'username': request.user.username,
            'role': user_role
        })

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):

        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    def get_permissions(self):

        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]