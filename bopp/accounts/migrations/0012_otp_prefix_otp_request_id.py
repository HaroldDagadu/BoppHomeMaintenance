# Generated by Django 5.0 on 2024-09-30 13:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_remove_otp_prefix_remove_otp_request_id_otp_otp'),
    ]

    operations = [
        migrations.AddField(
            model_name='otp',
            name='prefix',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
        migrations.AddField(
            model_name='otp',
            name='request_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
