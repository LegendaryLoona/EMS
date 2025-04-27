from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, UserViewSet, TestAuthView, RequestAdminListView, RequestListCreateView, RequestReviewView, DepartmentViewSet, EmployeeViewSet, submit_task, review_task, department_employees, my_profile, TaskViewSet, MarkAttendanceView, EmployeeMonthlyAttendanceView, MyAttendanceView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('test-auth/', TestAuthView.as_view(), name='test-auth'),
    path('my-profile/', my_profile),
    path('departments/<int:department_id>/employees/', department_employees),
    path('attendance/mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('attendance/<int:employee_id>/monthly/', EmployeeMonthlyAttendanceView.as_view(), name='monthly-attendance'),
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('tasks/<int:task_id>/submit/', submit_task, name='submit_task'),
    path('tasks/<int:task_id>/review/', review_task, name='review_task'),
    path('requests/manager/', RequestListCreateView.as_view(), name='manager-requests'),
    path('requests/admin/', RequestAdminListView.as_view(), name='admin-requests'),
    path('requests/<int:pk>/review/', RequestReviewView.as_view(), name='request-review'),


]