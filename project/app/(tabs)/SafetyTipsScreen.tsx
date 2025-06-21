import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';

interface SafetyTipsScreenProps {
  navigation: NavigationProp<any>;
}

const SafetyTipsScreen: React.FC<SafetyTipsScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cyclone Safety Tips</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🌪️ Stay Informed</Text>
          <Text style={styles.tipText}>
            Monitor weather alerts and updates from official sources like the Meteorological Department.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🏠 Secure Your Home</Text>
          <Text style={styles.tipText}>
            Reinforce windows, doors, and roofs to withstand strong winds. Remove loose outdoor items.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📦 Prepare Emergency Kit</Text>
          <Text style={styles.tipText}>
            Have essentials like bottled water, non-perishable food, first aid, flashlights, and extra batteries.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🚪 Evacuate If Advised</Text>
          <Text style={styles.tipText}>
            Follow official evacuation orders. Move to higher ground in flood-prone areas.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📱 Keep Communication Ready</Text>
          <Text style={styles.tipText}>
            Charge mobile phones, power banks, and stay connected with emergency contacts.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🚗 Avoid Travel</Text>
          <Text style={styles.tipText}>
            Stay indoors and avoid unnecessary travel during the cyclone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tipCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default SafetyTipsScreen;
