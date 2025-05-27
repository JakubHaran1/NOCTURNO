from django.contrib import admin
from .models import PartyModel, AddressModel, PartyUser, PartyGroup


class PartyAdmin(admin.ModelAdmin):
    list_display = ["party_title", "address", "date"]


class AddressAdmin(admin.ModelAdmin):

    list_display = ["city", "road", "house_number", "lat", "lng"]


class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "username", "birth"]


class GroupAdmin(admin.ModelAdmin):
    list_display = ["name"]


admin.site.register(PartyModel, PartyAdmin)
admin.site.register(AddressModel, AddressAdmin)
admin.site.register(PartyUser, UserAdmin)
admin.site.register(PartyGroup, GroupAdmin)
