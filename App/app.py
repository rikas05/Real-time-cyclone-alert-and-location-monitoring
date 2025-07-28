from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
import joblib
import pandas as pd
import requests
import threading
import time
import math
from datetime import datetime, timedelta
from pydantic import BaseModel
import random

app = FastAPI()

# Testing flags
TEST_MODE = True
HARSH_TEST = True  # When True, force harsh weather conditions

# Define realistic ranges for parameters.
RANGES = {
    "Latitude": (8.0, 37.0),
    "Longitude": (68.0, 97.0),
    "Maximum Wind": (50, 300),
    "Minimum Pressure": (900, 1020),
    "Low Wind": (10, 50),
    "Moderate Wind": (20, 70),
    "High Wind": (40, 120)
}

# Initial weather state.
STATE = {
    "Latitude": 20.0,
    "Longitude": 80.0,
    "Maximum Wind": 100.0,
    "Minimum Pressure": 1000.0,
    "Low Wind NE": 30.0,
    "Low Wind SE": 30.0,
    "Low Wind NW": 30.0,
    "Low Wind SW": 30.0,
    "Moderate Wind NE": 50.0,
    "Moderate Wind SE": 50.0,
    "Moderate Wind NW": 50.0,
    "Moderate Wind SW": 50.0,
    "High Wind NE": 70.0,
    "High Wind SE": 70.0,
    "High Wind NW": 70.0,
    "High Wind SW": 70.0,
    "Cyclonic": False,
    "Cyclonic Severity": 0.0
}

#############################################
# Load the trained cyclone prediction model
#############################################
model_path = "models/cyclone_model.pkl"
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    raise RuntimeError("Model file not found. Train and save the model first.")

CYCLONE_STATUS_DESCRIPTIONS = {
    0: "No cyclone is expected in this area.",
    1: "Tropical Depression: Weak cyclone; minimal impact expected.",
    2: "Tropical Storm: Moderate cyclone; potential for rain and strong winds.",
    3: "Hurricane: Severe cyclone; prepare for heavy rain, strong winds, and damage.",
    4: "Extratropical Cyclone: Cyclone formed outside the tropics; strong winds possible.",
    5: "Subtropical Depression: Weak storm; limited impact expected.",
    6: "Subtropical Storm: Moderate storm; expect rain and moderate winds.",
    7: "Low Pressure: Localized low-pressure system; no major impact.",
    8: "Tropical Wave: Weak atmospheric wave; no immediate threat.",
    9: "Disturbance: Weather disturbance; unlikely to develop into a cyclone."
}

#############################################
# Background Weather State Updater
#############################################
def apply_trends():
    """
    Updates the global STATE with new weather trends.
    Args: None
    Returns: None
    """
    global STATE
    trend_factor = 0.1  # Base fluctuation factor

    if STATE["Cyclonic"]:
        STATE["Minimum Pressure"] -= random.uniform(0.5, 1.0)
        STATE["Minimum Pressure"] = max(STATE["Minimum Pressure"], RANGES["Minimum Pressure"][0])
        STATE["Cyclonic Severity"] = min(STATE["Cyclonic Severity"] + 0.1, 10.0)
    else:
        STATE["Minimum Pressure"] += random.uniform(-0.2, 0.5)
        STATE["Minimum Pressure"] = min(STATE["Minimum Pressure"], RANGES["Minimum Pressure"][1])

    pressure_diff = 1013 - STATE["Minimum Pressure"]
    wind_multiplier = 1 + (pressure_diff / 1000)

    for key in STATE:
        if "Wind" in key:
            base_wind = STATE[key]
            fluctuation = random.uniform(-1, 1) * trend_factor
            STATE[key] = max(base_wind * wind_multiplier + fluctuation, 0)

    if STATE["Minimum Pressure"] < 980.0:
        STATE["Cyclonic"] = True
    elif STATE["Minimum Pressure"] > 995.0:
        STATE["Cyclonic"] = False
        STATE["Cyclonic Severity"] = max(STATE["Cyclonic Severity"] - 0.1, 0)

def background_updater():
    """
    Runs the apply_trends function in a loop to update weather state.
    Args: None
    Returns: None
    """
    global STATE
    while True:
        apply_trends()
        time.sleep(60)  # Update every minute

# Start the weather updater thread now that globals are defined.
thread = threading.Thread(target=background_updater, daemon=True)
thread.start()

#############################################
# Global Weather Data Fetching (for our own API)
#############################################
WEATHER_API_URL = "http://127.0.0.1:8000/current"
latest_weather_data = {}

def fetch_weather_data():
    """
    Continuously fetches live weather data and updates latest_weather_data.
    Args: None
    Returns: None
    """
    global latest_weather_data
    while True:
        try:
            response = requests.get(WEATHER_API_URL)
            if response.status_code == 200:
                latest_weather_data = response.json().get("weather_data", {})
            else:
                print(f"Weather API error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error fetching weather data: {e}")
        time.sleep(10)

threading.Thread(target=fetch_weather_data, daemon=True).start()

#############################################
# Prediction Endpoints
#############################################
@app.post("/predict")
def predict(features: dict):
    """
    Args:
        features (dict): Dictionary of input features for prediction.
    Returns:
        dict: Cyclone status and description.
    """
    try:
        input_df = pd.DataFrame([features])
        expected_features = model.feature_names_in_
        missing_features = set(expected_features) - set(input_df.columns)
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        input_df = input_df[expected_features]
        prediction = model.predict(input_df)[0]
        description = CYCLONE_STATUS_DESCRIPTIONS.get(prediction, "Unknown cyclone status.")
        return {"cyclone_status": int(prediction), "description": description}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.get("/real_time_prediction")
def real_time_cyclone_prediction():
    """
    Returns real-time cyclone prediction based on latest weather data.
    Args: None
    Returns: dict
    """
    global latest_weather_data
    if not latest_weather_data:
        raise HTTPException(status_code=503, detail="No weather data available.")
    try:
        input_df = pd.DataFrame([latest_weather_data])
        expected_features = model.feature_names_in_
        missing_features = set(expected_features) - set(input_df.columns)
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        input_df = input_df[expected_features]
        prediction = model.predict(input_df)[0]
        description = CYCLONE_STATUS_DESCRIPTIONS.get(prediction, "Unknown cyclone status.")
        return {
            "timestamp": latest_weather_data.get("timestamp"),
            "weather_data": latest_weather_data,
            "cyclone_prediction": {"cyclone_status": int(prediction), "description": description},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real-time prediction failed: {str(e)}")

#############################################
# WebSocket Notification Setup
#############################################
active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket):
    """
    WebSocket endpoint for real-time communication.
    Args:
        websocket: WebSocket connection object.
    Returns: None
    """
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Server received: {data}")
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_notification(message: str):
    """
    Broadcasts a message to all active WebSocket connections.
    Args:
        message (str): Message to send.
    Returns: None
    """
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            print("Error sending notification to a connection:", e)

#############################################
# Proximity Alert Endpoint (Using WebSocket Notifications)
#############################################
class ProximityRequest(BaseModel):
    latitude: float
    longitude: float

@app.post("/check_proximity")
async def check_proximity(request: ProximityRequest):
    """
    Args:
        request (ProximityRequest): Contains latitude and longitude.
    Returns:
        dict: Alert message, distance, and danger zones.
    """
    if not latest_weather_data:
        raise HTTPException(status_code=503, detail="No weather data available.")
    
    cyclone_lat = latest_weather_data.get("Latitude")
    cyclone_lon = latest_weather_data.get("Longitude")
    if cyclone_lat is None or cyclone_lon is None:
        raise HTTPException(status_code=500, detail="Cyclone center coordinates not available.")
    
    distance = haversine(request.latitude, request.longitude, cyclone_lat, cyclone_lon)
    severity = latest_weather_data.get("Cyclonic Severity", 0)
    max_wind = latest_weather_data.get("Maximum Wind", 0)
    danger_zones = calculate_danger_radius(severity, max_wind)
    
    if distance <= danger_zones["yellow_zone"] or TEST_MODE:
        if distance <= danger_zones["red_zone"]:
            alert_level = "critical"
        elif distance <= danger_zones["orange_zone"]:
            alert_level = "warning"
        else:
            alert_level = "precaution"
        
        test_note = " [TEST MODE]" if TEST_MODE else ""
        message_text = (
            f"Cyclone Alert{test_note}! A cyclone is approximately {round(distance, 2)} km away from your location. "
            "Please take necessary precautions."
        )
        await broadcast_notification(message_text)
        
        return {
            "message": f"{alert_level.capitalize()} alert sent via in-app notification{test_note}.",
            "distance": distance,
            "danger_zones": danger_zones
        }
    else:
        return {
            "message": "No alert necessary. You are outside the danger zone.",
            "distance": distance,
            "danger_zones": danger_zones
        }

#############################################
# Weather Data Endpoints
#############################################
@app.get("/current")
def get_current_weather():
    """
    Returns the current weather data.
    Args: None
    Returns: dict
    """
    if HARSH_TEST:
        reference_lat = 20.0
        reference_lon = 80.0
        # Offset for 20-30 km: between ~0.18 and 0.27 degrees
        offset = random.uniform(0.18, 0.27)
        angle = random.uniform(0, 2 * math.pi)
        delta_lat = offset * math.cos(angle)
        delta_lon = offset * math.sin(angle) / math.cos(math.radians(reference_lat))
        STATE["Latitude"] = reference_lat + delta_lat
        STATE["Longitude"] = reference_lon + delta_lon
        
        # Force harsh weather parameters:
        STATE["Minimum Pressure"] = 960.0    # Very low pressure
        STATE["Maximum Wind"] = 200.0        # High wind speed
        STATE["Cyclonic"] = True
        STATE["Cyclonic Severity"] = 7.0     # High severity
        
        # Optionally, adjust other wind parameters if needed:
        STATE["Low Wind NE"] = 50.0
        STATE["Moderate Wind NE"] = 100.0
        STATE["High Wind NE"] = 150.0

    return {
        "timestamp": datetime.now(),
        "weather_data": STATE
    }

@app.post("/simulate_cyclone")
def simulate_cyclonic_condition():
    """
    Simulates a cyclonic condition in the weather state.
    Args: None
    Returns: dict
    """
    global STATE
    STATE["Cyclonic"] = True
    STATE["Minimum Pressure"] = min(STATE["Minimum Pressure"], 970.0)
    
    if HARSH_TEST:
        reference_lat = 20.0
        reference_lon = 80.0
        offset = random.uniform(0.18, 0.27)
        angle = random.uniform(0, 2 * math.pi)
        delta_lat = offset * math.cos(angle)
        delta_lon = offset * math.sin(angle) / math.cos(math.radians(reference_lat))
        STATE["Latitude"] = reference_lat + delta_lat
        STATE["Longitude"] = reference_lon + delta_lon
        
        # Force harsh weather parameters:
        STATE["Minimum Pressure"] = 960.0
        STATE["Maximum Wind"] = 200.0
        STATE["Cyclonic Severity"] = 7.0

    return {
        "message": "Cyclonic condition simulated.",
        "weather_data": STATE
    }

@app.post("/reset")
def reset_weather():
    """
    Resets the weather state to baseline values.
    Args: None
    Returns: dict
    """
    global STATE
    STATE.update({
        "Latitude": random.uniform(*RANGES["Latitude"]),
        "Longitude": random.uniform(*RANGES["Longitude"]),
        "Maximum Wind": 100.0,
        "Minimum Pressure": 1000.0,
        "Low Wind NE": 30.0,
        "Low Wind SE": 30.0,
        "Low Wind NW": 30.0,
        "Low Wind SW": 30.0,
        "Moderate Wind NE": 50.0,
        "Moderate Wind SE": 50.0,
        "Moderate Wind NW": 50.0,
        "Moderate Wind SW": 50.0,
        "High Wind NE": 70.0,
        "High Wind SE": 70.0,
        "High Wind NW": 70.0,
        "High Wind SW": 70.0,
        "Cyclonic": False,
        "Cyclonic Severity": 0.0
    })
    return {"message": "Weather state reset to baseline."}

@app.get("/forecast")
def get_weather_forecast(hours: int = 6):
    """
    Args:
        hours (int): Number of hours to forecast (default 6).
    Returns:
        dict: Forecast data for the specified hours.
    """
    if hours < 1 or hours > 48:
        raise HTTPException(status_code=400, detail="Forecast range must be between 1 and 48 hours.")

    forecast = []
    simulated_state = STATE.copy()

    for hour in range(1, hours + 1):
        simulated_state["Minimum Pressure"] += random.uniform(-0.3, 0.3)
        simulated_state["Minimum Pressure"] = max(min(simulated_state["Minimum Pressure"], RANGES["Minimum Pressure"][1]), RANGES["Minimum Pressure"][0])
        pressure_diff = 1013 - simulated_state["Minimum Pressure"]
        wind_multiplier = 1 + (pressure_diff / 1000)
        for key in simulated_state:
            if "Wind" in key:
                fluctuation = random.uniform(-0.5, 0.5)
                simulated_state[key] = max(simulated_state[key] * wind_multiplier + fluctuation, 0)
        forecast.append({
            "hour": hour,
            "timestamp": (datetime.now() + timedelta(hours=hour)).isoformat(),
            "weather_data": simulated_state.copy()
        })

    return {"forecast": forecast}
