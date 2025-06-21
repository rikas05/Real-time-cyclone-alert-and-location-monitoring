import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

export default function RegistrationScreen({
  onRegisterSuccess
}: {
  onRegisterSuccess?: (phone: string) => void; // made optional if not passed
}) {
  const router = useRouter();

  // Basic registration details
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);

  // 🚀 **Step 1: Show In-App Notification with Purple Gradient**
  //     We define a custom toast configuration for the gradient background.
  const toastConfig = {
    purpleGradient: ({ text1, text2 }: any) => (
      <LinearGradient
        colors={['#6B4EFF', '#9B51E0']}
        style={styles.toastContainer}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 ? <Text style={styles.toastSubtitle}>{text2}</Text> : null}
        </View>
      </LinearGradient>
    )
  };

  // 🚀 **Step 2: Handle Registration**
  const handleRegister = async () => {
    if (!name || !age || !emergencyContact) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      // Store user details in AsyncStorage (phoneNumber was set in TabNavigator)
      const userData = { name, age, emergencyContact };
      await AsyncStorage.setItem('userDetails', JSON.stringify(userData));

      // Show a standard alert
      Alert.alert('Registration Successful', `Welcome, ${name}!`);

      // 🚀 **Step 3: Show Purple Gradient Toast**
      Toast.show({
        type: 'purpleGradient',
        text1: 'Welcome to the App!',
        text2: `Hello, ${name}! We're glad you're here.`,
        position: 'top',
        visibilityTime: 4000
      });

      // If parent wants to know registration success
      if (onRegisterSuccess) {
        const storedPhone = await AsyncStorage.getItem('phoneNumber');
        if (storedPhone) onRegisterSuccess(storedPhone);
      }

      // Finally, navigate to the tab navigator
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Attach our custom toast configuration */}
      <Toast config={toastConfig} />

      <View style={styles.header}>
        <Ionicons name="person-add" size={40} color="#6B4EFF" style={styles.icon} />
        <Text style={styles.title}>Complete Registration</Text>
        <Text style={styles.subtitle}>Enter your details to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="alert-circle-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 🎨 **Styles**
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 8,
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  registerButton: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  toastSubtitle: {
    color: '#fff'
  }
});
