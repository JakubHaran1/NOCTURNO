from django.db import models
from django.core import validators

import datetime


class PartyModel(models.Model):
    party_title = models.CharField(max_length=100, verbose_name="Party title")
    address = models.OneToOneField("AddressModel", on_delete=models.CASCADE)
    date = models.DateField(verbose_name="Date")
    creation_day = models.DateField(auto_now_add=True)
    people_number = models.IntegerField(
        validators=[validators.MinValueValidator(1)], verbose_name="People")
    age = models.IntegerField(validators=[validators.MinValueValidator(
        16, "You can't invite such young person..")], verbose_name="Age")
    alco = models.BooleanField(verbose_name="Alcohol")


class AddressModel(models.Model):
    city = models.CharField(max_length=50, verbose_name="City")
    street = models.CharField(max_length=100, verbose_name="Street")
    house_number = models.CharField(max_length=20, verbose_name="House number")
    lat_lng = models.CharField(max_length=500)
