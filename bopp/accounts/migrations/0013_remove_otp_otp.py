# Generated by Django 5.0 on 2024-09-30 14:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_otp_prefix_otp_request_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='otp',
            name='otp',
        ),
    ]
