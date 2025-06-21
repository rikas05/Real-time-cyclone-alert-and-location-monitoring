import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShelterCard = ({ name, address, contact }) => (
  <View style={styles.shelterCard}>
    <View style={styles.shelterInfo}>
      <Text style={styles.shelterName}>{name}</Text>
      <Text style={styles.shelterAddress}>{address}</Text>
      <View style={styles.shelterDetails}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
            Linking.openURL(url);
          }}>
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const url = `tel:${contact}`;
            Linking.openURL(url);
          }}>
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function SheltersScreen() {
  const shelters = [
    {
      name: 'HOPE World Wide India',
      address: 'House no 2554, Opp. Muhyedin Juma Masjid, Near Govt VHSS-HSS, Kunnupuram P.O, Edappally, Kochi, Kerala 682024',
      contact: '9895155475',
    },
    {
      name: 'Don Bosco Nivas',
      address: 'TC25/913, Thampanoor Near New Theatre, Aristo, Thampanoor, Thiruvananthapuram, Kerala 695014',
      contact: '9496003337',
    },
    {
      name: 'Welfare Service Ernakulam',
      address: 'Anjumuri Bus Stop, Ponnuruni, Vyttila P.O, Kochi, Kerala 682019',
      contact: '04842344243',
    },
    {
      name: 'Peermade Development Society',
      address: 'Kottayam-Kumily Rd, Peermade, Azhutha, Kerala 685501',
      contact: '04869232197',
    },
    {
      name: 'Shreyas',
      address: 'Sultan Bathery, Kerala 673592',
      contact: '04936220002',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Shelters</Text>
        <Text style={styles.subtitle}>Find safe shelters in your area</Text>
      </View>
      <ScrollView style={styles.shelterList}>
        {shelters.map((shelter, index) => (
          <ShelterCard key={index} {...shelter} />
        ))}
      </ScrollView>
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
  shelterList: {
    padding: 20,
  },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  shelterInfo: {
    marginBottom: 16,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  shelterAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  shelterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});
