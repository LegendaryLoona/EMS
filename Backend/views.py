# views.py
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Department, Employee, Attendance
from .serializers import DepartmentSerializer, CustomUserSerializer, EmployeeSerializer, AttendanceSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_department_attendance(request):
    try:
        manager_employee = Employee.objects.get(user=request.user)
        department = manager_employee.department
        employees = Employee.objects.filter(department=department)
        attendances = Attendance.objects.filter(employee__in=employees).select_related('employee')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response({"error": "Manager profile not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_attendance(request):
    """
    Manager provides: employee ID, date, clock_in, and clock_out times
    """
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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