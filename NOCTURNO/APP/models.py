
from enum import unique
from pickle import TRUE
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core import validators
from django.core.exceptions import ValidationError


from django.utils.translation import gettext as _
from django.utils.text import slugify

from django.contrib.auth.models import AbstractUser


from datetime import date
import os

from PIL import Image


def uploadAvatar(username, file):
    name = slugify(username)
    return os.path.join("users_image", name, file)


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
    # file_thumb = models.FileField(
    #     _("File_thumb"), upload_to="party_images/", blank=True)

    class Meta:
        verbose_name = _("party")
        verbose_name_plural = _("parties")

    def __str__(self):
        return f"{self.party_title}: {self.date}"

    def save(self, **kwargs):
        file_path = self.file.path
        thumb_path = os.path.splitext(file_path)[0] + '.thumbnail'
        size = (220, 110)
        # Create thumbnail
        try:
            with Image.open(file_path) as im:
                im.thumbnail(size)
                im.save(thumb_path, 'WEBP')

        except OSError:
            print("can not create thumbnail for", thumb_path)

        # Save new wersion partie's banner
        try:
            with Image.open(file_path) as im:
                if (im.width > 1200 or im.height > 1200):
                    im.resize(size=(1200, 1200))
        except OSError:
            print("can not resize file", file_path)

        return super().save()


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
    username = models.CharField(
        _("Name"), max_length=30, help_text="You can pass only 30 letters username.", unique=True)
    email = models.EmailField(
        _("email field"), max_length=254, blank=False, unique=True)
    birth = models.DateField(
        _("birth date"))

    avatar = models.FileField(_("File"), upload_to=uploadAvatar)

    class Meta:
        verbose_name = "partyUser"
        verbose_name_plural = "partyUsers"

    def __str__(self):
        return f'{self.username},{self.email},{self.id}'

    def follow(self, other_user):
        if self != other_user:
            FollowModel.objects.get_or_create(
                follower=self, followed=other_user)

    def un_follow(self, other_user):

        FollowModel.objects.filter(follower=self, followed=other_user).delete()

    def has_friends(self):
        return self.following.exists()


class PartyGroup(models.Model):
    name = models.CharField(_("Group name"), max_length=50, unique=True)
    desc = models.CharField(_("Group desc"), max_length=50)

    class Meta:
        verbose_name = "partyGroup"
        verbose_name_plural = "partyGroups"


class FollowModel(models.Model):
    follower = models.ForeignKey(
        PartyUser,  on_delete=models.CASCADE, related_name="following")

    followed = models.ForeignKey(
        PartyUser, on_delete=models.CASCADE, related_name="followers")

    data_followed = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ["follower", "followed"]

    def __str__(self):
        return f'{self.follower}  -> following -> {self.followed}'
