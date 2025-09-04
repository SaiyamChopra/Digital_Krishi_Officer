import streamlit as st
import requests
import pandas as pd
from datetime import datetime

def get_location():
    """Get user's location using IP geolocation"""
    try:
        ip_url = "https://ipapi.co/json/"
        response = requests.get(ip_url)
        if response.status_code == 200:
            data = response.json()
            return data.get('city', 'Mumbai'), data.get('country_code', 'IN')
        return 'Mumbai', 'IN'
    except:
        return 'Mumbai', 'IN'

def get_weather_data(city, country, api_key):
    """Fetch weather data for given location"""
    weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={city},{country}&appid={api_key}&units=metric"
    return requests.get(weather_url)

def get_forecast_data(city, country, api_key):
    """Fetch 5-day forecast data"""
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city},{country}&appid={api_key}&units=metric"
    return requests.get(forecast_url)

def display_current_weather(weather_data):
    """Display current weather information"""
    st.markdown(f"### {weather_data['name']}, {weather_data['sys']['country']}")
    st.markdown(f"# {weather_data['main']['temp']}°C")
    st.markdown(f"### {weather_data['weather'][0]['main']}")
    
    # Weather icon
    icon_code = weather_data['weather'][0]['icon']
    icon_url = f"http://openweathermap.org/img/w/{icon_code}.png"
    st.image(icon_url, width=100)
    
    # Weather metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric(
            "Temperature",
            f"{weather_data['main']['temp']}°C",
            f"{weather_data['main']['temp_max'] - weather_data['main']['temp_min']:+}°C"
        )
    with col2:
        st.metric(
            "Humidity",
            f"{weather_data['main']['humidity']}%"
        )
    with col3:
        st.metric(
            "Wind",
            f"{weather_data['wind']['speed']} m/s"
        )
    
    # Additional details
    with st.expander("More Details"):
        col1, col2 = st.columns(2)
        with col1:
            st.write("**Feels Like:** ", f"{weather_data['main']['feels_like']}°C")
            st.write("**Pressure:** ", f"{weather_data['main']['pressure']} hPa")
            st.write("**Visibility:** ", f"{weather_data.get('visibility', 'N/A')/1000:.1f} km")
        with col2:
            if 'rain' in weather_data:
                st.write("**Rain (1h):** ", f"{weather_data['rain'].get('1h', 0)} mm")
            sunrise = datetime.fromtimestamp(weather_data['sys']['sunrise']).strftime('%H:%M')
            sunset = datetime.fromtimestamp(weather_data['sys']['sunset']).strftime('%H:%M')
            st.write("**Sunrise:** ", sunrise)
            st.write("**Sunset:** ", sunset)

def display_forecast(forecast_data):
    """Display 5-day forecast"""
    st.markdown("### 5-Day Forecast")
    forecast_items = []
    
    for item in forecast_data['list']:
        date = pd.to_datetime(item['dt'], unit='s')
        if date.hour == 12:  # Get only noon forecasts
            forecast_items.append({
                'Date': date.strftime('%a, %b %d'),
                'Temperature': item['main']['temp'],
                'Description': item['weather'][0]['main'],
                'Icon': item['weather'][0]['icon']
            })
    
    # Display forecast cards
    cols = st.columns(len(forecast_items))
    for col, item in zip(cols, forecast_items):
        with col:
            st.markdown(f"**{item['Date']}**")
            st.image(f"http://openweathermap.org/img/w/{item['Icon']}.png", width=50)
            st.markdown(f"{item['Temperature']:.1f}°C")
            st.markdown(f"*{item['Description']}*")
