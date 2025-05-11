from django.urls import path, include
from APP.views import mainView, mapView, reverseGeo


urlpatterns = [
    path("", mainView, name="home"),
    path("map", mapView.as_view(), name="map"),
    path("map/reverseGeocoding", reverseGeo, name="reverseGeo")

]
