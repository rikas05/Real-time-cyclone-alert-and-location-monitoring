import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  ActivityIndicator,
  Alert,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import HomeScreen from './Home';
import DangerZonesScreen from './danger-zones';
import SheltersScreen from './shelters';
import EmergencyScreen from './emergency';
import RegistrationScreen from './RegistrationScreen';

const Tab = createBottomTabNavigator();

// Toggle to true if you want a fresh start once per app launch
const RESET_STORAGE_ON_LAUNCH = true;

export default function TabNavigator() {
  // Define your toast config with both purple and redWarning types
  const toastConfig = {
    purpleGradient: ({ text1, text2 }: any) => (
      <LinearGradient
        // Fully opaque RGBA colors
        colors={['rgba(107,78,255,1)', 'rgba(155,81,224,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.toastContainer}
      >
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 ? <Text style={styles.toastSubtitle}>{text2}</Text> : null}
        </View>
      </LinearGradient>
    ),
    redWarning: ({ text1, text2 }: any) => (
      <LinearGradient
        colors={['rgba(255,0,0,1)', 'rgba(255,100,100,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.toastContainer}
      >
        <Ionicons
          name="warning"
          size={24}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.toastTitle, { color: '#fff' }]}>{text1}</Text>
          {text2 ? <Text style={[styles.toastSubtitle, { color: '#fff' }]}>{text2}</Text> : null}
        </View>
      </LinearGradient>
    ),
  };

  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (RESET_STORAGE_ON_LAUNCH) {
          const alreadyReset = await AsyncStorage.getItem('HAS_RESET_THIS_SESSION');
          if (!alreadyReset) {
            console.log('🔄 Resetting AsyncStorage...');
            await AsyncStorage.clear();
            await AsyncStorage.setItem('HAS_RESET_THIS_SESSION', 'true');
          }
        }
        const storedPhone = await AsyncStorage.getItem('phoneNumber');
        setIsRegistered(!!storedPhone);
      } catch (error) {
        console.error('❌ Error checking registration:', error);
        setIsRegistered(false);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handlePhoneCheck = async () => {
    if (!phone) {
      Alert.alert('Missing Info', 'Please enter your phone number.');
      return;
    }
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('phoneNumber');
      if (storedPhone === phone) {
        Alert.alert('Welcome Back!', 'Redirecting to home screen...');
        router.replace('/(tabs)');
      } else {
        await AsyncStorage.setItem('phoneNumber', phone);
        Alert.alert('Welcome!', 'Please complete your registration.');
        router.replace('/(tabs)/RegistrationScreen');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
        </View>
      ) : !isRegistered ? (
        <View style={styles.container}>
          <Ionicons name="call-outline" size={40} color="#6B4EFF" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your mobile number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={handlePhoneCheck}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#6B4EFF',
            tabBarInactiveTintColor: '#9CA3AF',
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Danger Zones"
            component={DangerZonesScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="warning" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Shelters"
            component={SheltersScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="business" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="SOS"
            component={EmergencyScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
      )}

      {/* Render the Toast in an absolute container so it stays on top */}
      <View style={styles.absoluteToast}>
        <Toast config={toastConfig} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  icon: {
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#111827',
  },
  button: {
    backgroundColor: '#6B4EFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Toast styles for individual toast items
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  toastSubtitle: {
    marginTop: 2,
    color: '#FFF',
  },
  // Absolute container to ensure Toast is on top
  absoluteToast: {
    position: 'absolute',
    top: 50, // adjust as needed
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
