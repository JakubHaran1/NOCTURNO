from email import message
import html
import re
from django.conf import settings

from django import views
from django.views import View
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView, PasswordResetDoneView
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm

from django.contrib.auth import get_user_model

from .forms import PartyForm, AddressForm, RegisterForm, EmailChangeForm
from .models import PartyModel, AddressModel, PartyUser
from .tokens import emailActivationToken


from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.http import JsonResponse

from django.core.mail import send_mail

from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.utils.html import strip_tags


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


def emailSending(user, mail_subject, context, htmlTemplate):

    html_mail = render_to_string(
        htmlTemplate, context)

    plain_mail = strip_tags(html_mail)
    to_addres = user.email

    email = send_mail(subject=mail_subject,
                      message=plain_mail,
                      from_email=settings.EMAIL_HOST_USER,
                      recipient_list=[to_addres],
                      html_message=html_mail)


def searchingBuddie(request):
    if request.method == "GET":
        nick = request.GET.get("nick", "")
        nick_type = "username"
        search_type_cookie = request.COOKIES.get("searchingType")

        if "@" in nick:
            nick_type = "email"
        else:
            nick_type = "username"

        if search_type_cookie == "Find":
            filter_query = f'{nick_type}__unaccent__icontains'

            quering_response = PartyUser.objects.filter(**{filter_query: nick})
            quering_data = list(quering_response.values('avatar', "username"))

            return JsonResponse(quering_data, safe=False)
        else:

            if not request.user.is_authenticated:
                return

            user = request.user
            quering_response = user.friends.all()
            print(quering_response)

            quering_data = list(quering_response.values('avatar', "username"))
            return JsonResponse(quering_data, safe=False)


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

            htmlTemplate = "email_confirm.html"
            emailSending(user, mail_subject, mail_context, htmlTemplate)

        return render(request, "register.html", {"form": form})


class ConfirmationView(View):
    def get(self, request, uidb64, token):
        users = get_user_model()
        user = None
        try:
            user_id = urlsafe_base64_decode(uidb64)
            user = users.objects.get(pk=user_id)
        except:

            messages.add_message(request, messages.ERROR,
                                 "Chceck your email - maybe it is wrong ❌❌")

            return redirect("email-change")

        if user is not None and emailActivationToken.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect("home")
        return redirect("register")


class ResetPasswordEmailView(PasswordResetView):
    email_template_name = "txt/reset_password.txt"
    form_class = PasswordResetForm
    from_email = settings.EMAIL_HOST_USER
    html_email_template_name = 'reset_password_message.html'
    subject_template_name = "txt/reset_password_subject.txt"
    success_url = reverse_lazy("password_reset_done")
    template_name = "reset_password_email.html"


class ResetPasswordView(PasswordResetConfirmView):
    template_name = 'reset_password.html'
    success_url = '/login'
    form_class = SetPasswordForm


class ResetDoneView(PasswordResetDoneView):
    template_name = "reset_password_confirmation.html"


class BuddiesView(View):
    def get(self, request):
        user_friends = request.user.friends.order_by("-date_joined")[:5]
        return render(request, "buddies.html", {
            "user_friends": user_friends
        })
