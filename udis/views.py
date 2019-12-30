from django.shortcuts import render

from Examen.settings import tokenApi


def mainPage(request):
        return render(request, "udisView.html",{"apikey":tokenApi})
