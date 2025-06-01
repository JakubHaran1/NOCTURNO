from django.urls import path, include
from APP.views import mainView, mapView, LoginUserView, reverseGeo


urlpatterns = [
    path("", mainView, name="home"),
    path("map", mapView.as_view(), name="map"),
    path("geocode-reverse", reverseGeo, name="reverseGeo"),
    path("login", LoginUserView.as_view())
    # path("register", RegisterView.as_view())
]
