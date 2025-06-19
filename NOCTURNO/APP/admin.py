from django.contrib import admin
from .models import PartyModel, AddressModel, PartyUser, PartyGroup
from django.contrib.auth.admin import UserAdmin


class PartyAdmin(admin.ModelAdmin):
    list_display = ["party_title", "address", "date"]


class AddressAdmin(admin.ModelAdmin):

    list_display = ["city", "road", "house_number", "lat", "lng"]


class UserPartyAdmin(UserAdmin):
    list_display = ["email", "username", "birth"]
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ("avatar", 'email', 'birth', "friends")}))


class GroupAdmin(admin.ModelAdmin):
    list_display = ["name"]


admin.site.register(PartyModel, PartyAdmin)
admin.site.register(AddressModel, AddressAdmin)
admin.site.register(PartyUser, UserPartyAdmin)
admin.site.register(PartyGroup, GroupAdmin)
