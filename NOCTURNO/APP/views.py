from asyncio.windows_events import NULL
from email import message
import html
from logging import log
import re
from sys import flags
from django.conf import settings

from django import views
from django.views import View
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView, PasswordResetDoneView
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm

from django.contrib.auth import get_user_model

from .forms import PartyForm, AddressForm, RegisterForm, EmailChangeForm
from .models import PartyModel, AddressModel, PartyUser, FollowModel
from .tokens import emailActivationToken


from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.urls import reverse
from django.core.mail import send_mail
from django.core.paginator import Paginator

from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.html import strip_tags
from django.template.loader import render_to_string


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
    lon = request.GET.get('lng')

    geoHeader = {'User-Agent': 'NOCTURNO'}

    geoResponse = requests.get(url, headers=geoHeader, params={
        "lat": lat, "lon": lon, "zoom": 18, "format": "json"},).json()

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


# Views
@login_required(login_url="login")
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
        attempt = 0
        if party.is_valid() and address.is_valid():
            address.save()
            address_instance = address.instance
            party.save(commit=False)
            party.instance.address = address_instance
            party.save(commit=True)
        else:
            attempt = 1

        return render(request, "map.html", {
            "partyForm": party,
            "addressForm": address,
            "parties": parties,
            "attempt": attempt
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


# Początkowe wyświetlanie buddies -> generowanie pocztkowego html wraz z buddies uzytkownika
# BuddiesView stanowi baze dla dalszych operacji na template -> jedyny view odnoszący się do buddies który nie zwraca json response
class BuddiesView(View):
    def get(self, request):
        users_subscriptions = request.user.following.all()
        return render(request, "buddies.html", {
            "friends_relation": users_subscriptions
        })


# Zwraca 5 (10) najnowszych użytkowników dla find/yours 5/10 -> umozliwia zmiane typow i dynamiczne generowanie html bez przeładowania strony
def initFindBuddie(request):
    search_type_cookie = request.COOKIES.get("searchingType")
    user = request.user

    # Zdobywanie id zaobserwowanych przez uzytkownika
    friends_ids = list(user.following.values_list("followed__id", flat=True))

    # Sprawdzanie typu
    if search_type_cookie == "Find":
        new_friend_query = PartyUser.objects.all()

        user_response = list(new_friend_query.values(
            "id", "avatar", "username"))
        # Dla find dodatkowo zwracany friends_ids do wygenerowania odpowiedniego przycisku
        return JsonResponse([user_response, friends_ids], safe=False)

    else:
        # Kod dla Yours
        # Zwrócenie queryseta z zaobserwowanymi userami na podstawie id
        new_friend_query = PartyUser.objects.filter(
            id__in=friends_ids)

        user_response = list(new_friend_query.values(
            "id", "avatar", "username"))

        return JsonResponse([user_response], safe=False)


# Wyszukiwanie i zwracanie użytkowników
def searchingBuddie(request):
    if request.method == "GET":
        nick = request.GET.get("nick", "")
        nick_type = "username"
        search_type_cookie = request.COOKIES.get("searchingType")

        if "@" in nick:
            nick_type = "email"
        else:
            nick_type = "username"

        filter_query = f'{nick_type}__unaccent__icontains'

        user = request.user
        if search_type_cookie == "Find":
            quering_response = PartyUser.objects.filter(**{filter_query: nick})
            quering_data = list(quering_response.values(
                'avatar', "username", "id"))
            friends_ids = list(user.following.values_list(
                "followed__id", flat=True))

            return JsonResponse([quering_data, friends_ids], safe=False)
        else:

            quering_response = PartyUser.objects.filter(
                followers__follower=user, **{filter_query: nick})

            quering_data = list(quering_response.values('avatar', "username"))
            return JsonResponse(quering_data, safe=False)


def addDeleteBuddie(request):
    if request.method == "POST":
        action_friend = json.loads(request.body)

        [friendID, action] = action_friend
        user = request.user

        if str(friendID) == str(user.id):
            return JsonResponse({"error": "You can't observe yourself :("}, safe=False)

        friend = PartyUser.objects.get(id=friendID)
        if action == "add":
            user.follow(friend)
        else:
            user.un_follow(friend)

        return JsonResponse({"redirect": reverse("buddies")}, safe=False)
