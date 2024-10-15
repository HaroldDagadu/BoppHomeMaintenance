from rest_framework import serializers
from .models import job


class jobSerializer(serializers.ModelSerializer):

    class Meta:
        model = job
        fields = [
            'id', 
            'job_title', 
            'job_description', 
            'user_name', 
            'user_phone_number', 
            'user_community', 
            'user_house_number', 
            'user_idnum', 
            'picture', 
            'category', 
            'status', 
            'work_date', 
            'assigned_to', 
            'name', 
            'phone_number', 
            'community', 
            'house_number', 
            'is_approved', 
            'approved_by', 
            'is_deleted', 
            'notes', 
            'time_added'
        ]

