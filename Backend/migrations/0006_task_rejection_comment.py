# Generated by Django 5.1.2 on 2025-04-26 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Backend', '0005_remove_leaverequest_approved_by_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='rejection_comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
