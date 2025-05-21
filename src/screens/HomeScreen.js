import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BluetoothService from '../services/BluetoothService';

const DeviceCard = ({ name, icon, onPress, isConnected }) => (
  <TouchableOpacity
    style={[styles.card, isConnected && styles.cardConnected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <Icon name={icon} size={32} color={isConnected ? "#4ade80" : "#2563eb"} />
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={[styles.connectionStatus, { color: isConnected ? "#4ade80" : "#ef4444" }]}>
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const devices = [
    {
      id: '1',
      name: 'WindTrax',
      icon: 'fan',
    },
  ];

  const handleDevicePress = async (deviceId) => {
    if (isConnected) {
      // If already connected, navigate to fan control
      navigation.navigate('Fan');
    } else {
      // If not connected, try to connect
      try {
        setIsConnecting(true);
        Alert.alert('Scanning', 'Searching for WindTrax fan...');
        
        const device = await BluetoothService.scanForDevice();
        if (device) {
          Alert.alert('Found Device', 'Connecting to WindTrax fan...');
          await BluetoothService.connectToDevice(device.id);
          setIsConnected(true);
          Alert.alert('Success', 'Connected to WindTrax fan');
          navigation.navigate('Fan');
        } else {
          Alert.alert('Error', 'WindTrax fan not found. Please make sure it is turned on and in range.');
        }
      } catch (error) {
        console.error('Connection error:', error);
        if (error.message.includes('not found')) {
          Alert.alert('Error', 'Bluetooth module not found. Please check your app installation.');
        } else {
          Alert.alert('Error', 'Failed to connect to fan. Please try again.');
        }
      } finally {
        setIsConnecting(false);
      }
    }
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
            isConnected={isConnected}
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
  cardConnected: {
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  connectionStatus: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default HomeScreen; 