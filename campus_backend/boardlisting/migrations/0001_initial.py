# Generated by Django 5.1.6 on 2025-04-28 18:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="BoardListing",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("organization", models.CharField(max_length=255)),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("HIRING", "Hiring"),
                            ("EVENT", "Event"),
                            ("VOLUNTEER", "Volunteer"),
                            ("COMPETITION", "Competition"),
                            ("HACKATHON", "HACKATHON"),
                            ("OTHER", "Other"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("BUSINESS", "Business"),
                            ("CLUB", "Club"),
                            ("NIGHTLIFE", "Nightlife"),
                        ],
                        max_length=20,
                    ),
                ),
                ("description", models.TextField(max_length=1000)),
                ("paid_position", models.BooleanField()),
                ("open_to", models.JSONField(blank=True, default=list)),
                ("application_deadline", models.DateField(blank=True, null=True)),
                ("tags", models.TextField(blank=True, max_length=500, null=True)),
            ],
        ),
    ]
