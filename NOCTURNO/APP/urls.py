from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.main, name="home"),
    path("map", views.map, name="map")
]
