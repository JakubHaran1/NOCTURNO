from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import json
import requests


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
        return render(request, "map.html")
