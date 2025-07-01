from dataclasses import field, fields
import email
from pyexpat import model
from django import forms


from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.forms.widgets import DateInput
from django.urls import include
from APP.models import PartyModel, AddressModel, PartyUser

from django.core.exceptions import ValidationError

from datetime import date


class myDateInput(DateInput):
    input_type = "date"


class PartyForm(forms.ModelForm):
    date = forms.DateField(widget=myDateInput)

    class Meta:
        model = PartyModel
        exclude = ["creation_day", "address"]

    def clean(self):
        cleaned_data = super().clean()
        age = cleaned_data.get("age")
        alco = cleaned_data.get("alco")
        print(alco)
        if age < 18 and alco:
            raise ValidationError("You can't drink alcohol before 18")
        return cleaned_data


class AddressForm(forms.ModelForm):
    alco = forms.BooleanField(required=False)

    class Meta:
        model = AddressModel
        fields = '__all__'


class LoginForm(AuthenticationForm):
    def confirm_login_allowed(self, user):
        pass


class RegisterForm(UserCreationForm):
    birth = forms.DateField(widget=myDateInput)
    avatar = forms.FileField(required=False)

    def clean_birth(self):
        clean_birth = self.cleaned_data["birth"]
        today = date.today()

        print(type(clean_birth.month))
        age = (today.year - clean_birth.year) - ((today.month, today.day)
                                                 < (clean_birth.month, clean_birth.day))
        if (age) < 16:
            raise ValidationError("You have to be older than 16 years old")
        return clean_birth

    class Meta:
        model = PartyUser
        fields = ("username", "email", "password1",
                  "password2", "birth", "avatar")


class EmailChangeForm(forms.Form):
    email = forms.EmailField(required=True)
