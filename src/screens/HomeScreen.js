import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DeviceCard = ({ name, icon, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <Icon name={icon} size={32} color="#2563eb" />
      <Text style={styles.deviceName}>{name}</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  // TODO: Add state management for connected devices
  const devices = [
    {
      id: '1',
      name: 'WindTrax',
      icon: 'fan',
    },
  ];

  const handleDevicePress = (deviceId) => {
    // TODO: Implement navigation to device control panel
    navigation.navigate('Fan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Devices Dashboard</Text>
      </View>
      
      <View style={styles.devicesGrid}>
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            name={device.name}
            icon={device.icon}
            onPress={() => handleDevicePress(device.id)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  devicesGrid: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default HomeScreen; 