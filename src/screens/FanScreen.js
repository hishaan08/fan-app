import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BluetoothService from '../services/BluetoothService';

const { width } = Dimensions.get('window');

const SPEED_PRESETS = {
  LOW: 33,
  MEDIUM: 66,
  HIGH: 100
};

const FanScreen = ({ navigation }) => {
  const [isOn, setIsOn] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    connectToFan();
    return () => {
      BluetoothService.disconnect();
    };
  }, []);

  const connectToFan = async () => {
    try {
      const device = await BluetoothService.scanForDevice();
      if (device) {
        await BluetoothService.connectToDevice(device.id);
        setIsConnected(true);
        Alert.alert('Success', 'Connected to fan controller');
      } else {
        Alert.alert('Error', 'Fan controller not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to fan controller');
      console.error(error);
    }
  };

  // Animation setup
  useEffect(() => {
    if (isOn) {
      const duration = 1000 * (100 / fanSpeed);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isOn, fanSpeed]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePowerToggle = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to fan controller');
      return;
    }

    try {
      const newState = !isOn;
      await BluetoothService.sendCommand({ power: newState });
      if (newState) {
        setFanSpeed(SPEED_PRESETS.MEDIUM);
      } else {
        setFanSpeed(0);
      }
      setIsOn(newState);
    } catch (error) {
      Alert.alert('Error', 'Failed to control fan');
      console.error(error);
    }
  };

  const handleSpeedChange = async (speed) => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to fan controller');
      return;
    }

    try {
      await BluetoothService.sendCommand({ speed });
      setFanSpeed(speed);
      if (speed > 0 && !isOn) {
        setIsOn(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change fan speed');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>FAN SPEED</Text>
        <TouchableOpacity>
          <Icon name="dots-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <Icon 
          name={isConnected ? "bluetooth-connected" : "bluetooth-disabled"} 
          size={24} 
          color={isConnected ? "#4ade80" : "#ef4444"} 
        />
        <Text style={[styles.statusText, { color: isConnected ? "#4ade80" : "#ef4444" }]}>
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
      </View>

      {/* Fan Display */}
      <View style={styles.fanContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="fan" size={width * 0.5} color="#4ade80" />
        </Animated.View>
      </View>

      {/* Speed Preset Buttons */}
      <View style={styles.speedButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.speedButton,
            fanSpeed === SPEED_PRESETS.LOW && styles.speedButtonActive
          ]}
          onPress={() => handleSpeedChange(SPEED_PRESETS.LOW)}
        >
          <Text style={styles.speedButtonText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.speedButton,
            fanSpeed === SPEED_PRESETS.MEDIUM && styles.speedButtonActive
          ]}
          onPress={() => handleSpeedChange(SPEED_PRESETS.MEDIUM)}
        >
          <Text style={styles.speedButtonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.speedButton,
            fanSpeed === SPEED_PRESETS.HIGH && styles.speedButtonActive
          ]}
          onPress={() => handleSpeedChange(SPEED_PRESETS.HIGH)}
        >
          <Text style={styles.speedButtonText}>High</Text>
        </TouchableOpacity>
      </View>

      {/* Power Button */}
      <TouchableOpacity
        style={[styles.powerButton, isOn && styles.powerButtonActive]}
        onPress={handlePowerToggle}
      >
        <Text style={styles.powerButtonText}>
          {isOn ? 'Turn Off' : 'Turn On'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  speedButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#3b82f6',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  powerButton: {
    backgroundColor: '#1e293b',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  powerButtonActive: {
    backgroundColor: '#3b82f6',
  },
  powerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FanScreen; 