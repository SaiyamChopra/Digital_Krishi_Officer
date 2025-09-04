import streamlit as st
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import plotly.express as px
from PIL import Image
import io
import requests

# Set page config
st.set_page_config(
    page_title="Agricultural Advisory System",
    page_icon="🌾",
    layout="wide"
)

# Initialize theme in session state if not present
if 'theme' not in st.session_state:
    st.session_state.theme = 'light'

# Theme toggle in sidebar
with st.sidebar:
    st.write("## 🎨 Theme Settings")
    theme = st.toggle("Dark Mode", value=st.session_state.theme == 'dark')
    st.session_state.theme = 'dark' if theme else 'light'
    
    # Apply theme using custom CSS
    if st.session_state.theme == 'dark':
        st.markdown("""
            <style>
                .stApp {
                    background-color: #1E1E1E;
                    color: #FFFFFF;
                }
                .stButton>button {
                    background-color: #4A4A4A;
                    color: #FFFFFF;
                }
                .stTextInput>div>div>input {
                    background-color: #3B3B3B;
                    color: #FFFFFF;
                }
                .stSelectbox>div>div>select {
                    background-color: #3B3B3B;
                    color: #FFFFFF;
                }
            </style>
            """, unsafe_allow_html=True)
    else:
        st.markdown("""
            <style>
                .stApp {
                    background-color: #FFFFFF;
                    color: #000000;
                }
            </style>
            """, unsafe_allow_html=True)

# Title and description
st.title("🌾 Agricultural Advisory System")
st.markdown("""
This system helps farmers with crop yield predictions, weather analysis, and agricultural recommendations.
""")

# Sidebar sections
st.sidebar.markdown("---")
st.sidebar.header("Input Parameters")

# Main sections
tab1, tab2, tab3 = st.tabs(["Crop Yield Prediction", "Weather Analysis", "Agricultural Inputs"])

with tab1:
    st.header("Crop Yield Prediction")
    
    # Sample input parameters for crop yield prediction
    crop_type = st.selectbox(
        "Select Crop Type",
        ["Rice", "Wheat", "Corn", "Banana", "Coffee"]
    )
    
    col1, col2 = st.columns(2)
    with col1:
        rainfall = st.number_input("Average Rainfall (mm)", 0.0, 5000.0, 1000.0)
        temperature = st.number_input("Average Temperature (°C)", 0.0, 50.0, 25.0)
    
    with col2:
        soil_type = st.selectbox(
            "Soil Type",
            ["Sandy", "Loamy", "Clay", "Silt"]
        )
        area = st.number_input("Area (hectares)", 0.1, 1000.0, 1.0)

    if st.button("Predict Yield"):
        # Placeholder for ML model prediction
        # In a real application, you would load your trained model here
        predicted_yield = np.random.normal(4000, 1000)  # Dummy prediction
        st.success(f"Predicted yield: {predicted_yield:.2f} kg/hectare")

with tab2:
    st.header("Weather Analysis")
    
    try:
        OPENWEATHER_API_KEY = st.secrets["OPENWEATHER_API_KEY"]
    except KeyError:
        st.error("OpenWeather API key not found in secrets.toml. Please add it to continue.")
        st.stop()

    from weather_helper import get_location, get_weather_data, get_forecast_data, display_current_weather, display_forecast

    # Create tabs for different weather views
    weather_tabs = st.tabs(["Current Location", "Search Location"])
    
    with weather_tabs[0]:
        st.markdown("### Current Location Weather")
        if st.button("Get Weather for Current Location"):
            city, country = get_location()
            st.success(f"📍 Located in {city}, {country}")
            
            # Get current weather
            response = get_weather_data(city, country, OPENWEATHER_API_KEY)
            if response.status_code == 200:
                weather_data = response.json()
                display_current_weather(weather_data)
                
                # Get and display forecast
                forecast_response = get_forecast_data(city, country, OPENWEATHER_API_KEY)
                if forecast_response.status_code == 200:
                    display_forecast(forecast_response.json())
            else:
                if response.status_code == 401:
                    st.error("Invalid API key. Please check your OpenWeather API key in secrets.toml")
                else:
                    st.error(f"Error fetching weather data: {response.status_code}")
    
    with weather_tabs[1]:
        st.markdown("### Search Weather by Location")
        col1, col2 = st.columns(2)
        with col1:
            city = st.text_input("Enter City Name", "Mumbai")
        with col2:
            country = st.text_input("Enter Country Code", "IN")
        
        if st.button("Search Weather"):
            # Get current weather
            response = get_weather_data(city, country, OPENWEATHER_API_KEY)
            if response.status_code == 200:
                weather_data = response.json()
                display_current_weather(weather_data)
                
                # Get and display forecast
                forecast_response = get_forecast_data(city, country, OPENWEATHER_API_KEY)
                if forecast_response.status_code == 200:
                    display_forecast(forecast_response.json())
            else:
                if response.status_code == 401:
                    st.error("Invalid API key. Please check your OpenWeather API key in secrets.toml")
                else:
                    st.error(f"Error fetching weather data: {response.status_code}")

with tab3:
    st.header("Agricultural Inputs")
    
    # File uploader for disease detection
    uploaded_file = st.file_uploader("Upload a picture of your crop for disease detection", type=["jpg", "png", "jpeg"])
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image", use_column_width=True)
        
        # Placeholder for disease detection
        st.info("Image analysis would be performed here with a trained model")

# Feedback section
st.sidebar.markdown("---")
st.sidebar.subheader("Feedback")
feedback = st.sidebar.text_area("Share your feedback")
if st.sidebar.button("Submit Feedback"):
    st.sidebar.success("Thank you for your feedback!")
