
from django.db import models

from django.core import validators
from django.core.exceptions import ValidationError


from django.utils.translation import gettext as _

from django.contrib.auth.models import AbstractUser


from datetime import date


def date_checker(value):
    if date.today() > value:
        raise ValidationError(f"This date isn't correct")


class PartyModel(models.Model):
    party_title = models.CharField(_("Party title"), max_length=100)
    address = models.OneToOneField("AddressModel", on_delete=models.CASCADE)

    date = models.DateField(_("Date"), validators=[date_checker])
    creation_day = models.DateField(auto_now_add=True)
    people_number = models.IntegerField(_("People"),
                                        validators=[validators.MinValueValidator(1)])
    age = models.IntegerField(_("Age"), validators=[validators.MinValueValidator(
        16, "You can't invite such young person..")])
    alco = models.BooleanField(_("Alcohol"), default=False)
    file = models.FileField(_("File"), upload_to="party_images/")

    class Meta:
        verbose_name = _("party")
        verbose_name_plural = _("parties")

    def __str__(self):
        return f"{self.party_title}: {self.date}"

    def clean(self):
        cleaned_data = super().clean()
        age = self.age
        alco = self.alco
        if age < 18 and alco:
            raise ValidationError("You can't drink alcohol before 18")


class AddressModel(models.Model):
    city = models.CharField(_("city"), max_length=50)
    road = models.CharField(_("road"), max_length=100)
    house_number = models.CharField(_("house number"), max_length=20)
    lat = models.CharField(max_length=9, null=True)
    lng = models.CharField(max_length=9, null=True)

    class Meta:
        verbose_name = "address"
        verbose_name_plural = "addresses"

    def __str__(self):
        return f"{self.city},{self.road},{self.house_number}"


class PartyUser(AbstractUser):
    email = models.EmailField(_("email field"), max_length=254, blank=True)
    birth = models.DateField(_("birth date"), blank=True)
    friends = models.ManyToManyField(
        "self", blank=True)
    groups = models.ManyToManyField("PartyGroup", blank=False)

    class Meta:
        verbose_name = "partyUser"
        verbose_name_plural = "partyUsers"


class PartyGroup(models.Model):
    name = models.CharField(_("Group name"), max_length=50, unique=True)
    desc = models.CharField(_("Group desc"), max_length=50)

    class Meta:
        verbose_name = "partyGroup"
        verbose_name_plural = "partyGroups"
