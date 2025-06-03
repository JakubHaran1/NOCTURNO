from dataclasses import field, fields
from pyexpat import model
from django import forms


from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.urls import include
from APP.models import PartyModel, AddressModel, PartyUser
from django.forms.widgets import DateInput


class myDateInput(DateInput):
    input_type = "date"


class PartyForm(forms.ModelForm):
    date = forms.DateField(widget=myDateInput)

    class Meta:
        model = PartyModel
        exclude = ["creation_day", "address"]


class AddressForm(forms.ModelForm):
    class Meta:
        model = AddressModel
        fields = '__all__'


class LoginForm(AuthenticationForm):
    def confirm_login_allowed(self, user):
        pass


class RegisterForm(UserCreationForm):

    birth = forms.DateField(widget=myDateInput)

    class Meta:
        model = PartyUser
        fields = ("username", "email", "password1",
                  "password2", "birth", "avatar")
