from .forms import PartyForm, AddressForm
from .models import PartyModel, AddressModel

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse

import json
import requests

import datetime

# Helping functions


def reverseGeo(request):
    if request.method == "POST":
        [lat, lng] = json.loads(request.body)
        geoApi = f'https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&zoom=18'
        geoHeader = {'User-Agent': 'NOCTURNO'}
        geoResponse = requests.get(geoApi, headers=geoHeader).json()
        display_name = geoResponse['display_name']
        [lat, lng] = json.loads(request.body)
        return JsonResponse(display_name, safe=False)


# Views
def mainView(request):
    return render(request, "main.html")


class mapView(View):

    def get(self, request):
        partyForm = PartyForm()

        addressForm = AddressForm()
        return render(request, "map.html", {
            "partyForm": partyForm,
            "addressForm": addressForm
        })

    def post(self, request):
        address = AddressForm(request.POST)
        party = PartyForm(request.POST)

        if party.is_valid() and address.is_valid():
            address.save()
            address_instance = address.instance
            party.save(commit=False)
            party.instance.address = address_instance
            party.save(commit=True)

        return render(request, "map.html", {
            "partyForm": party,
            "addressForm": address
        })
