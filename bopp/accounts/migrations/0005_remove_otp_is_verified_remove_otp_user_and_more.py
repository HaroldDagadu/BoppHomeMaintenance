# Generated by Django 5.0.7 on 2024-09-17 23:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_remove_otp_expiration_time_remove_otp_phone_number_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='otp',
            name='is_verified',
        ),
        migrations.RemoveField(
            model_name='otp',
            name='user',
        ),
        migrations.AddField(
            model_name='otp',
            name='phone_number',
            field=models.CharField(default='', max_length=15),
        ),
        migrations.AlterField(
            model_name='otp',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
