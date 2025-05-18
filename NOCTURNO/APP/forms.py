from django import forms
from APP.models import PartyModel, AddressModel
from django.forms.widgets import DateInput


class myDateInput(DateInput):
    input_type = "date"


class PartyForm(forms.ModelForm):
    date = forms.DateField( widget=myDateInput)

    class Meta:
        model = PartyModel
        exclude=["creation_day","address"]


class AddressForm(forms.ModelForm):
    class Meta:
        model = AddressModel
        exclude = ["lat_lng"]
