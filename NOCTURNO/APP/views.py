from django.shortcuts import render


def main(request):
    return render(request, "main.html")


def map(request):
    return render(request, "map.html")
