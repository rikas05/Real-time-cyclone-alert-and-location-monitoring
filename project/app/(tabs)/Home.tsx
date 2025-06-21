import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import axios from 'axios';

/** 
 * Helper to map the cyclone_status code to styling and text. 
 */
function getStatusStyle(status: number) {
  switch (status) {
    case 0:
      return {
        label: 'SAFE',
        containerColor: '#DCFCE7',
        textColor: '#166534',
      };
    case 1:
    case 2:
      return {
        label: 'CAUTION',
        containerColor: '#FEF9C3',
        textColor: '#92400E',
      };
    case 3:
    case 4:
    case 5:
      return {
        label: 'WARNING',
        containerColor: '#FDE68A',
        textColor: '#92400E',
      };
    default:
      return {
        label: 'DANGER',
        containerColor: '#FCA5A5',
        textColor: '#7F1D1D',
      };
  }
}

const StatusCard = ({
  cycloneStatus,
  lastUpdated,
  windSpeed,
}: {
  cycloneStatus: number | null;
  lastUpdated?: string;
  windSpeed?: number;
}) => {
  const status = cycloneStatus ?? 0;
  const styleMap = getStatusStyle(status);

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <View style={[styles.statusIndicator, { backgroundColor: styleMap.containerColor }]}>
          <Text style={[styles.statusText, { color: styleMap.textColor }]}>
            {styleMap.label}
          </Text>
        </View>
      </View>

      <View style={styles.statusDetails}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Last Updated</Text>
          <Text style={styles.statusValue}>
            {lastUpdated ? lastUpdated : 'N/A'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Wind Speed</Text>
          <Text style={styles.statusValue}>
            {windSpeed !== undefined ? `${windSpeed} km/h` : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const RecentAlert = ({
  title,
  time,
  type,
}: {
  title: string;
  time: string;
  type: string;
}) => (
  <View style={styles.alertCard}>
    <View style={styles.alertIcon}>
      <Ionicons name="alert-circle" size={24} color="#6B4EFF" />
    </View>
    <View style={styles.alertContent}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertTime}>{time}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
  </View>
);

export default function HomeScreen() {
  // -------------- Toast Configuration --------------
  const toastConfig = {
    purpleGradient: ({ text1, text2 }: any) => (
      <LinearGradient
        colors={['rgba(107,78,255,1)', 'rgba(155,81,224,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toastContainer}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
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
        end={{ x: 1, y: 0 }}
        style={styles.toastContainer}
      >
        <Ionicons name="warning" size={24} color="#fff" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.toastTitle, { color: '#fff' }]}>{text1}</Text>
          {text2 ? <Text style={[styles.toastSubtitle, { color: '#fff' }]}>{text2}</Text> : null}
        </View>
      </LinearGradient>
    ),
  };

  // -------------- State --------------
  const [prediction, setPrediction] = useState<any>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [smsSent, setSmsSent] = useState<boolean>(false); 
  // We track if we've already triggered the alert once.
  const [alertTriggered, setAlertTriggered] = useState(false);

  // -------------- Fetch Real-Time Prediction --------------
  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.168.251:8001/real_time_prediction');
      const data = await response.json();
      if (data) {
        setPrediction(data);

        // Convert timestamp
        const ts = data.timestamp ? new Date(data.timestamp) : new Date();
        const formattedTime = ts.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setLastUpdatedTime(formattedTime);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    } catch (err) {
      console.error('Error fetching real-time prediction:', err);
    }
  };

  // Initiate the fetch, then poll every 10s
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Hardcode status to 6 for demonstration
  const cycloneStatus = 7;

  // -------------- Alert + Alarm useEffect --------------
  useEffect(() => {
    // If status > 5 and we haven't triggered it yet
    if (cycloneStatus > 5 && !alertTriggered) {
      setAlertTriggered(true); // Mark as triggered so we only do it once

      // 1) Show Red Toast
      Toast.show({
        type: 'redWarning',
        text1: 'Severe Cyclone Alert!',
        text2: 'Immediate precautions required!',
        position: 'top',
        visibilityTime: 10000,
        topOffset: 80,
      });

      // 2) Play alarm for 10s
      const playAlarm = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/alarm.mp3')
          );
          await sound.playAsync();
          setTimeout(() => {
            sound.stopAsync();
            sound.unloadAsync();
          }, 10000);
        } catch (e) {
          console.log('Error playing alarm sound:', e);
        }
      };
      playAlarm();

      // 3) Optionally send SMS here if desired:
      if (!smsSent) {
        const sendSMS = async () => {
          try {
            const API_KEY = '9c611dc8-ef0f-4197-89ae-91ae882c5ef5';
            const DEVICE_ID = '67b6661d7add5ffeac3a0e45';
            const recipients = ['+918590996041'];
            const message = 'Cyclone Alert! Severe cyclone detected with wind speeds exceeding 200 km/h near your location. Please stay indoors, secure loose objects, prepare an emergency kit and follow local authorities’ emergency instructions immediately.';
            await axios.post(`https://api.textbee.dev/api/v1/gateway/devices/${DEVICE_ID}/send-sms`, {
              recipients,
              message,
            }, {
              headers: {
                'x-api-key': API_KEY,
              },
            });
            console.log('SMS has been sent');
            setSmsSent(true);
          } catch (error) {
            console.error('Error sending SMS:', error);
          }
        };
        sendSMS();}
    }
  }, [cycloneStatus, alertTriggered,smsSent]);

  // -------------- Data for Status Card --------------
  const rawWindSpeed = prediction?.weather_data?.['Maximum Wind'];
  const windSpeed = rawWindSpeed !== undefined ? Math.round(rawWindSpeed) : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <Toast config={toastConfig} />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.location}>Kottayam, India</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#6B4EFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Status Card */}
        {isInitialLoad ? (
          <ActivityIndicator size="large" color="#6B4EFF" style={{ margin: 20 }} />
        ) : (
          <StatusCard
            cycloneStatus={cycloneStatus}
            lastUpdated={lastUpdatedTime}
            windSpeed={windSpeed}
          />
        )}

        {/* Recent Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <RecentAlert title="Heavy rainfall expected" time="2 hours ago" type="warning" />
          <RecentAlert title="Wind speed advisory" time="5 hours ago" type="info" />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
  <Text style={styles.sectionTitle}>Quick Actions</Text>
  <View style={styles.actionGrid}>
    {['Emergency Contacts', 'Weather Forecast', 'Evacuation Routes', 'Safety Tips'].map(
      (action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={() => {
            if (action === 'Safety Tips') {
              navigation.navigate('SafetyTips');
            }
            // Handle other actions as needed.
          }}
        >
          <Ionicons
            name={['call', 'cloudy', 'map', 'information-circle'][index]}
            size={24}
            color="#6B4EFF"
          />
          <Text style={styles.actionText}>{action}</Text>
        </TouchableOpacity>
      )
    )}
  </View>
</View>

      </ScrollView>
    </SafeAreaView>
  );
}

// -----------------------------------
// Styles
// -----------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: 'bold',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  alertTime: {
    color: '#6B7280',
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    color: '#111827',
    fontWeight: '500',
  },
  // Toast
  toastContainer: {
    zIndex: 9999,
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
});
