from django.contrib import admin
from .models import PartyModel, AddressModel

admin.site.register(AddressModel)
admin.site.register(PartyModel)


# Register your models here.
