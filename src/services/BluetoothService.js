import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

class BluetoothService {
  constructor() {
    this.device = null;
    this.isConnected = false;
    this.eventEmitter = new NativeEventEmitter(NativeModules.BluetoothManager);
  }

  async scanForDevice() {
    try {
      // For iOS, we need to use the native module
      if (Platform.OS === 'ios') {
        const { BluetoothManager } = NativeModules;
        if (!BluetoothManager) {
          throw new Error('BluetoothManager not found');
        }
        const devices = await BluetoothManager.scanForDevices();
        return devices.find(device => device.name === 'WindTrax');
      } else {
        // For Android, we'll use the built-in Bluetooth adapter
        const { BluetoothAdapter } = NativeModules;
        if (!BluetoothAdapter) {
          throw new Error('BluetoothAdapter not found');
        }
        const devices = await BluetoothAdapter.scanForDevices();
        return devices.find(device => device.name === 'WindTrax');
      }
    } catch (error) {
      console.error('Error scanning for device:', error);
      throw error;
    }
  }

  async connectToDevice(deviceId) {
    try {
      if (Platform.OS === 'ios') {
        const { BluetoothManager } = NativeModules;
        if (!BluetoothManager) {
          throw new Error('BluetoothManager not found');
        }
        await BluetoothManager.connectToDevice(deviceId);
      } else {
        const { BluetoothAdapter } = NativeModules;
        if (!BluetoothAdapter) {
          throw new Error('BluetoothAdapter not found');
        }
        await BluetoothAdapter.connectToDevice(deviceId);
      }
      this.device = deviceId;
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  async sendCommand(command) {
    if (!this.isConnected) {
      throw new Error('Not connected to device');
    }

    try {
      const commandString = JSON.stringify(command);
      if (Platform.OS === 'ios') {
        const { BluetoothManager } = NativeModules;
        if (!BluetoothManager) {
          throw new Error('BluetoothManager not found');
        }
        await BluetoothManager.sendData(this.device, commandString);
      } else {
        const { BluetoothAdapter } = NativeModules;
        if (!BluetoothAdapter) {
          throw new Error('BluetoothAdapter not found');
        }
        await BluetoothAdapter.sendData(this.device, commandString);
      }
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        if (Platform.OS === 'ios') {
          const { BluetoothManager } = NativeModules;
          if (!BluetoothManager) {
            throw new Error('BluetoothManager not found');
          }
          await BluetoothManager.disconnect(this.device);
        } else {
          const { BluetoothAdapter } = NativeModules;
          if (!BluetoothAdapter) {
            throw new Error('BluetoothAdapter not found');
          }
          await BluetoothAdapter.disconnect(this.device);
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      this.device = null;
      this.isConnected = false;
    }
  }
}

export default new BluetoothService(); 