# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, UserViewSet, TestAuthView, DepartmentViewSet, EmployeeViewSet, department_employees, my_profile, get_department_attendance, mark_attendance

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('test-auth/', TestAuthView.as_view(), name='test-auth'),
    path('my-profile/', my_profile),
    path('departments/<int:department_id>/employees/', department_employees),
    path('attendance/', get_department_attendance, name='department-attendance'),
    path('attendance/mark/', mark_attendance, name='mark-attendance'),
]