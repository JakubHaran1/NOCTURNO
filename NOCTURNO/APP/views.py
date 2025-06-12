from atexit import register

from django import views
from django.views import View
from django.contrib.auth.views import LoginView
from django.contrib.auth import get_user_model

from .forms import PartyForm, AddressForm, RegisterForm
from .models import PartyModel, AddressModel
from .tokens import emailActivationToken

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.http import JsonResponse

from django.core.mail import EmailMessage
from django.urls import reverse_lazy
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site


from django.contrib import messages


from datetime import date
import json
import requests


# Helping functions
def calcAge(birth_year, birth_month, birth_day):
    today = date.today()
    age = (today.year - birth_year) - \
        ((birth_month, birth_day) < (today.month, today.day))
    return age


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
@login_required(login_url="login")
def mainView(request):
    parties = PartyModel.objects.all()

    if request.user.is_authenticated:
        print(request.user)

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
    success_ur = "home"

    def get_success_url(self):
        return reverse_lazy('home')

    def form_invalid(self, form):
        response = super().form_invalid(form)
        messages.add_message(self.request, messages.ERROR,
                             "WRONG! PASSWORD or USERNAME")
        return self.render_to_response(self.get_context_data(form=form))


class RegisterView(views.View):
    def get(self, request):
        form = RegisterForm()
        return render(request, "register.html", {"form": form})

    def post(self, request):
        form = RegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            user.age = calcAge(
                user.birth.year, user.birth.month, user.birth.day)
            page = get_current_site(request)
            mail_subject = F"Confirm your email to finish user creation"
            mail_context = {"user": user,
                            "domain": page,
                            "subject": mail_subject,
                            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                            "token": emailActivationToken.make_token(user=user)}

            mail_messsage = render_to_string(
                "email_confirm.html", mail_context)
            to_addres = user.email

            email = EmailMessage(subject=mail_subject,
                                 body=mail_messsage, to=[to_addres])
            email.send()

            print(user.username)
        return render(request, "register.html", {"form": form})


class ConfirmationView(views.View):
    def get(self, request, uidb64, token):
        users = get_user_model()
        try:
            user_id = urlsafe_base64_decode(uidb64)
            user = users.objects.get(pk=user_id)
        except:
            user = None
            messages.add_message(
                request, messages.ERROR, "Something goes wrong! \n Create new confirmation link!")

        if user is not None and emailActivationToken.check_token(user, token):
            user.is_active = True
            return redirect("home")
        return redirect("register")
