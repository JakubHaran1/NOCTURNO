from django.shortcuts import render


def main(request):
    return render(request, "../templates/main.html")
