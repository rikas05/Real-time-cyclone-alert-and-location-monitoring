import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function EmergencyScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // WebSocket and SOS states.
  const [socket, setSocket] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [helpAssigned, setHelpAssigned] = useState(false);

  // Set up WebSocket connection.
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.168.251:8080'); // Replace with your computer’s IP.
    ws.onopen = () => {
      console.log('WebSocket connected (mobile)');
      setSocket(ws);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mobile received:', data);
      if (data.type === 'assignHelp' && data.user === 'Rikas') {
        setHelpAssigned(true);
      }
    };
    ws.onerror = (error) => console.log('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket closed (mobile)');
    return () => ws.close();
  }, []);

  // Request location permission and update state.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location access in settings to use this feature.');
        setLoading(false);
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setLoading(false);
    })();
  }, []);

  // Handler for SOS button press.
  const handleSOSPress = () => {
    setSosActive(true);
    if (socket) {
      socket.send(JSON.stringify({ type: 'sos', user: 'Rikas' }));
    }
  };

  // If help is assigned, compute a rescue location relative to the user's location.
  // This demo uses a simple offset; adjust as needed.
  if (helpAssigned && location) {
    const rescueLocation = {
      latitude: location.latitude + 0.03, // ~3 km north (approx.)
      longitude: location.longitude + 0.03, // ~3 km east (approx.)
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            ...location,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={location}
            title="You are here"
            description="Current Location"
          />
          <Marker
            coordinate={rescueLocation}
            title="Rescue Team"
            description="Help is on the way"
            pinColor="green"
          />
          <Polyline
            coordinates={[location, rescueLocation]}
            strokeColor="#7B68EE"
            strokeWidth={4}
          />
        </MapView>
      </SafeAreaView>
    );
  }

  // Otherwise, show the half-screen map and buttons.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text style={styles.loadingText}>Fetching location...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={location}
            showsUserLocation={true}
          >
            {location && (
              <Marker
                coordinate={location}
                title="You are here"
                description="Current Location"
              />
            )}
          </MapView>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          {helpAssigned
            ? 'Help is on the way! Tap for directions.'
            : 'Press the SOS button if you need immediate assistance.'}
        </Text>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOSPress}
          disabled={sosActive}
        >
          <View style={styles.sosInner}>
            <Ionicons name="alert-circle" size={40} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emergencyButton}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyText}>EMERGENCY CALL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    height: '50%',
  },
  map: {
    width: '100%',
    height: '100%',
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6B4EFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sosInner: {
    alignItems: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
