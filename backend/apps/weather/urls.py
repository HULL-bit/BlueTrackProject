from django.urls import path
from . import views

urlpatterns = [
    path('', views.WeatherDataListView.as_view(), name='weather-data'),
    path('current/', views.current_weather, name='current-weather'),
    path('forecast/', views.weather_forecast, name='weather-forecast'),
]