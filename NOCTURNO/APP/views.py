from .forms import PartyForm, AddressForm
from .models import PartyModel, AddressModel

from django.shortcuts import render
from django.views import View
from django.contrib.auth.views import LoginView
from django.http import JsonResponse

import json
import requests

import datetime

# Helping functions


def reverseGeo(request):
    url = 'https://nominatim.openstreetmap.org/reverse?'
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    geoApi = f'{url}lat={lat}&lon={lng}&format=json&zoom=18`'
    geoHeader = {'User-Agent': 'NOCTURNO'}
    geoResponse = requests.get(geoApi, headers=geoHeader, params={
                               "lat": lat, "lng": lng, "zoom": 18}).json()
    return JsonResponse(geoResponse, safe=False)


# Views
def mainView(request):
    parties = PartyModel.objects.all()
    return render(request, "main.html", {
        "parties": parties
    })


class mapView(View):

    def get(self, request):
        partyForm = PartyForm()
        addressForm = AddressForm()
        parties = PartyModel.objects.all()
        return render(request, "map.html", {
            "partyForm": partyForm,
            "addressForm": addressForm,
            "parties": parties
        })

    def post(self, request):
        address = AddressForm(request.POST)
        party = PartyForm(request.POST, request.FILES)
        parties = PartyModel.objects.all()

        if party.is_valid() and address.is_valid():
            address.save()
            address_instance = address.instance
            party.save(commit=False)
            party.instance.address = address_instance
            party.save(commit=True)

        return render(request, "map.html", {
            "partyForm": party,
            "addressForm": address,
            "parties": parties
        })


class LoginUserView(LoginView):
    template_name = "login.html"
