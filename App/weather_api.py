from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta
import random
import math
import threading
import time

app = FastAPI()

STATE = {
    "Latitude": 20.0,
    "Longitude": 80.0,
    "Maximum Wind": 100.0,  # Wind speed in km/h
    "Minimum Pressure": 1000.0,  # Pressure in hPa
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
    "Cyclonic Severity": 0.0  # Severity scale: 0 to 10
}

# Define realistic ranges for each parameter
RANGES = {
    "Latitude": (8.0, 37.0),
    "Longitude": (68.0, 97.0),
    "Maximum Wind": (50, 300),
    "Minimum Pressure": (900, 1020),
    "Low Wind": (10, 50),
    "Moderate Wind": (20, 70),
    "High Wind": (40, 120)
}

def apply_trends():
    """Update the weather state with realistic trends."""
    global STATE
    trend_factor = 0.1  # Base fluctuation factor

    # Adjust pressure based on cyclonic conditions
    if STATE["Cyclonic"]:
        STATE["Minimum Pressure"] -= random.uniform(0.5, 1.0)
        STATE["Minimum Pressure"] = max(STATE["Minimum Pressure"], RANGES["Minimum Pressure"][0])
        STATE["Cyclonic Severity"] = min(STATE["Cyclonic Severity"] + 0.1, 10.0)
    else:
        STATE["Minimum Pressure"] += random.uniform(-0.2, 0.5)
        STATE["Minimum Pressure"] = min(STATE["Minimum Pressure"], RANGES["Minimum Pressure"][1])

    # Adjust wind speeds based on pressure
    pressure_diff = 1013 - STATE["Minimum Pressure"]
    wind_multiplier = 1 + (pressure_diff / 1000)

    for key in STATE:
        if "Wind" in key:
            base_wind = STATE[key]
            fluctuation = random.uniform(-1, 1) * trend_factor
            STATE[key] = max(base_wind * wind_multiplier + fluctuation, 0)

    # Update cyclonic state based on pressure
    if STATE["Minimum Pressure"] < 980.0:
        STATE["Cyclonic"] = True
    elif STATE["Minimum Pressure"] > 995.0:
        STATE["Cyclonic"] = False
        STATE["Cyclonic Severity"] = max(STATE["Cyclonic Severity"] - 0.1, 0)

# Background thread to update weather state
def background_updater():
    while True:
        apply_trends()
        time.sleep(60)  # Update every minute

# Start the background thread
thread = threading.Thread(target=background_updater, daemon=True)
thread.start()

@app.get("/current")
def get_current_weather():
    """Return the current weather data."""
    return {
        "timestamp": datetime.now(),
        "weather_data": STATE
    }

@app.post("/simulate_cyclone")
def simulate_cyclonic_condition():
    """Force a cyclonic condition."""
    global STATE
    STATE["Cyclonic"] = True
    STATE["Minimum Pressure"] = min(STATE["Minimum Pressure"], 970.0)
    return {
        "message": "Cyclonic condition simulated.",
        "weather_data": STATE
    }

@app.post("/reset")
def reset_weather():
    """Reset weather state to baseline values."""
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
    """Provide a simple weather forecast for the next N hours."""
    if hours < 1 or hours > 48:
        raise HTTPException(status_code=400, detail="Forecast range must be between 1 and 48 hours.")

    forecast = []
    simulated_state = STATE.copy()

    for hour in range(1, hours + 1):
        # Simulate future trends
        simulated_state["Minimum Pressure"] += random.uniform(-0.3, 0.3)
        simulated_state["Minimum Pressure"] = max(min(simulated_state["Minimum Pressure"], RANGES["Minimum Pressure"][1]), RANGES["Minimum Pressure"][0])

        pressure_diff = 1013 - simulated_state["Minimum Pressure"]
        wind_multiplier = 1 + (pressure_diff / 1000)

        for key in simulated_state:
            if "Wind" in key:
                fluctuation = random.uniform(-0.5, 0.5)
                simulated_state[key] = max(simulated_state[key] * wind_multiplier + fluctuation, 0)

        # Append forecasted state
        forecast.append({
            "hour": hour,
            "timestamp": (datetime.now() + timedelta(hours=hour)).isoformat(),
            "weather_data": simulated_state.copy()
        })

    return {"forecast": forecast}
