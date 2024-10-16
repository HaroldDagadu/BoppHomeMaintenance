# Generated by Django 5.0 on 2024-10-06 12:20

import accounts.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_job_complaints_remove_job_priority_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='house_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, null=True, validators=[accounts.validators.validate_phone_number]),
        ),
        migrations.AlterField(
            model_name='job',
            name='user_house_number',
            field=models.CharField(blank=True, editable=False, max_length=20, null=True),
        ),
    ]
