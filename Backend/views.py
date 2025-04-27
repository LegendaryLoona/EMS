from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Department, Employee, Task, Attendance, Request
from .serializers import DepartmentSerializer, CustomUserSerializer, EmployeeSerializer, AttendanceSerializer, TaskSerializer, RequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta




class EmployeeMonthlyAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Fetch attendances in the last 30 days
        attendances = Attendance.objects.filter(employee=employee, date__gte=thirty_days_ago)

        attendance_map = {att.date: att for att in attendances}
        result = []

        for i in range(30):
            day = today - timedelta(days=i)
            att = attendance_map.get(day)
            result.append({
                'date': day,
                'clock_in': att.clock_in if att else None,
                'clock_out': att.clock_out if att else None,
                'was_present': bool(att and att.clock_in),
            })

        return Response(result[::-1])  # Oldest to newest


class MyAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee_profile
        attendances = Attendance.objects.filter(employee=employee).order_by('-date')[:30]  # last 30 days
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)



class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]



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
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_task(request, task_id):
    """Employee submits task for review"""
    try:
        task = Task.objects.get(id=task_id, assigned_to__user=request.user)
        if task.status != 'in_progress':
            return Response({'error': 'Only tasks in progress can be submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = 'submitted'  # Mark as completed for manager to review
        task.save()
        return Response({'success': 'Task submitted for review.'}, status=status.HTTP_200_OK)
    
    except Task.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_task(request, task_id):
    """Manager accepts or rejects a task"""
    try:
        task = Task.objects.get(id=task_id, assigned_by__user=request.user)
        action = request.data.get('action')
        comment = request.data.get('rejection_comment', '')

        if action == 'accept':
            task.status = 'completed'
            task.rejection_comment = ''
            task.save()
            return Response({'success': 'Task accepted and marked as completed.'}, status=status.HTTP_200_OK)
        
        elif action == 'reject':
            task.status = 'in_progress'
            task.rejection_comment = comment
            task.save()
            return Response({'success': 'Task rejected and sent back to employee.'}, status=status.HTTP_200_OK)
        
        else:
            return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

    except Task.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)
    

class RequestListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Request.objects.filter(submitted_by=self.request.user.employee_profile)

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user.employee_profile)

# Admin: View all requests
class RequestAdminListView(generics.ListAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAdminUser]

# Admin: Update a request (complete or decline)
class RequestReviewView(generics.UpdateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        action = request.data.get('action')
        comment = request.data.get('comment', '')

        if action == 'complete':
            instance.status = 'completed'
        elif action == 'decline':
            instance.status = 'declined'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        instance.admin_comment = comment
        instance.save()
        return Response(RequestSerializer(instance).data)