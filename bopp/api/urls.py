from django.urls import path
from .views import (
jobCreateView,   
jobListView,
    jobUpdateView,
    jobDeleteView,
    StaffjobListView,
    StaffStatView,
    jobListstat,
)

urlpatterns = [
    # Staff views
    path('alljobs/', StaffjobListView, name='all-job-list'),
    path('jobs/', jobListView, name='job-list'),
    path('jobs/create/', jobCreateView, name='job-create'),  # Route for creating a job
    path('jobs/<str:pk>/', jobUpdateView, name='job-update'),  # Route for updating a job
    path('jobs/<str:pk>/delete/', jobDeleteView, name='job-delete'),  # Route for deleting a job
    # Statistics views
    path('jobstat/', jobListstat, name='job-stat'),  # Route for job statistics
    path('StaffStats/', StaffStatView, name='staff-statistics'),  # Route for staff statistics
]
