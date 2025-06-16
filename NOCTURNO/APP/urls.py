from django.urls import path, include
from APP.views import mainView, mapView, LoginUserView, reverseGeo, RegisterView, ConfirmationView, ResetPasswordEmailView, ResetPasswordView, ResetDoneView


urlpatterns = [
    path("", mainView, name="home"),
    path("map", mapView.as_view(), name="map"),
    path("geocode-reverse", reverseGeo, name="reverseGeo"),
    path("login", LoginUserView.as_view(), name="login"),
    path("register", RegisterView.as_view(), name="register"),
    path("email-confirmation/<uidb64>/<token>",
         ConfirmationView.as_view(), name="activate_email"),


    path('reset-password', ResetPasswordEmailView.as_view(), name='reset-password'),
    path('change-password/<uidb64>/<token>',
         ResetPasswordView.as_view(), name='change-password'),
    path('reset-done', ResetDoneView.as_view(), name='password_reset_done')

]
