import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
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
  const [scannedDevices, setScannedDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  const handleScanPress = async () => {
    if (scanning) return;

    console.log('Scan button pressed. Starting scan...');
    setScanning(true);
    setScannedDevices([]);
    Alert.alert('Scanning', 'Searching for Bluetooth devices...');

    try {
      const devices = await BluetoothService.scanForDevice();
      console.log('Scan finished. Found devices:', devices);
      setScannedDevices(devices);
      if (devices.length === 0) {
        Alert.alert('No Devices', 'No Bluetooth devices found.');
      } else {
        Alert.alert('Scan Complete', `Found ${devices.length} device(s). Select one to connect.`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to start scan.');
    } finally {
      setScanning(false);
      console.log('Scan process ended.');
    }
  };

  const handleDevicePress = async (deviceId) => {
    console.log(`HomeScreen: handleDevicePress called with deviceId: ${deviceId}`);

    if (isConnecting) return;

    try {
      setIsConnecting(true);
      Alert.alert('Connecting', 'Attempting to connect to the selected device...');
      const device = scannedDevices.find(d => d.id === deviceId);
      console.log(`HomeScreen: Found device in scannedDevices:`, device);
      
      if (device) {
         const connectedDevice = await BluetoothService.connectToDevice(deviceId);
         setIsConnected(true);
         Alert.alert('Success', `Connected to ${connectedDevice.name || connectedDevice.id}`);
         navigation.navigate('Fan');
      } else {
          Alert.alert('Error', 'Device not found in scanned list.');
      }

    } catch (error) {
      console.error('HomeScreen: Connection error in handleDevicePress:', error);
      Alert.alert('Error', 'Failed to connect. Please try again.');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderDeviceItem = ({ item }) => (
    <DeviceCard
      name={item.name || 'Unknown Device'}
      icon={'bluetooth'}
      onPress={() => handleDevicePress(item.id)}
      isConnected={isConnected && BluetoothService.device && BluetoothService.device.id === item.id}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Devices Dashboard</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanPress}
        disabled={scanning || isConnecting}
      >
        <Text style={styles.scanButtonText}>{scanning ? 'Scanning...' : 'Scan for Devices'}</Text>
      </TouchableOpacity>

      <FlatList
        data={scannedDevices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.devicesList}
      />
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
  scanButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  devicesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default HomeScreen; 