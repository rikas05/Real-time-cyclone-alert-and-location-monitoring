import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Function to adjust cyclone location offshore (to keep it in the sea)
function adjustCycloneLocation(lat: number, lon: number): { latitude: number; longitude: number } {
  let newLat = lat;
  let newLon = lon;

  // Move cyclone offshore by adjusting latitude (move north if needed)
  if (lat > 10) {
    newLat -= 1.5; // Move it further into the ocean
  } else {
    newLat += 1.5;
  }

  return { latitude: newLat, longitude: newLon };
}

// Common danger zones (hardcoded) for cyclone-prone areas in India.
const commonDangerZones = [
  {
    id: 'odisha',
    name: 'Odisha Coast',
    coordinate: { latitude: 20.0, longitude: 86.0 },
    radius: 50000, // 50 km radius
  },
  {
    id: 'andhra',
    name: 'Andhra Pradesh Coast',
    coordinate: { latitude: 15.5, longitude: 80.0 },
    radius: 50000,
  },
  {
    id: 'westBengal',
    name: 'West Bengal Coast',
    coordinate: { latitude: 22.0, longitude: 88.0 },
    radius: 50000,
  },
];

export default function DangerZonesScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [cycloneLocation, setCycloneLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location access in settings to use this feature.');
        setLoading(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 2.5,
        longitudeDelta: 2.5,
      });
      setLoading(false);
    })();
  }, []);

  // Fetch cyclone data from API
  useEffect(() => {
    const fetchCycloneData = async () => {
      try {
        const response = await fetch('http://192.168.1.8:8001/real_time_prediction');
        const data = await response.json();
        
        if (data && data.weather_data && data.weather_data.Latitude && data.weather_data.Longitude) {
          let cycloneLat = Number(data.weather_data.Latitude);
          let cycloneLon = Number(data.weather_data.Longitude);

          // Adjust the cyclone location so it appears offshore (in the sea)
          const adjustedCyclone = adjustCycloneLocation(cycloneLat, cycloneLon);
          setCycloneLocation(adjustedCyclone);
        }
      } catch (err) {
        console.error('Error fetching cyclone data:', err);
      }
    };

    fetchCycloneData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danger Zones</Text>
        <Text style={styles.subtitle}>View active cyclone danger areas</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingText}>Fetching location...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={cycloneLocation ?? location ?? undefined}
          showsUserLocation={true}
        >
          {/* User Marker (Yellow Person Icon) */}
          {location && (
            <Marker coordinate={location} title="You are here">
              <Ionicons name="person" size={32} color="yellow" />
            </Marker>
          )}

          {/* Cyclone Marker and Danger Zone (Cyclone centered 100 km circle) */}
          {cycloneLocation && (
            <>
              <Marker coordinate={cycloneLocation} title="Cyclone Center">
                <Ionicons name="cloud" size={32} color="red" />
              </Marker>
              <Circle
                center={cycloneLocation}
                radius={100000} // 100 km radius
                fillColor="rgba(255, 0, 0, 0.2)"
                strokeColor="rgba(255, 0, 0, 0.5)"
              />
            </>
          )}

          {/* Common Danger Zones Markers & Circles */}
          {commonDangerZones.map(zone => (
            <React.Fragment key={zone.id}>
              <Marker
                coordinate={zone.coordinate}
                title={zone.name}
                description="Common Cyclone Danger Zone"
              >
                <Ionicons name="warning" size={24} color="orange" />
              </Marker>
              <Circle
                center={zone.coordinate}
                radius={zone.radius}
                fillColor="rgba(255, 165, 0, 0.1)"
                strokeColor="rgba(255, 165, 0, 0.8)"
              />
            </React.Fragment>
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
});
