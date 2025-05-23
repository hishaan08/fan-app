import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const SERVICE_UUID = '12345678-1234-5678-1234-56789ABCDEF0'; // Replace with your fan control service UUID
const CHARACTERISTIC_UUID = 'abcdef01-1234-5678-1234-56789abcdef0'; // Replace with your fan control characteristic UUID

class BluetoothService {
  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
    this.isConnected = false;
    this.serviceUUID = SERVICE_UUID; // Store UUIDs
    this.characteristicUUID = CHARACTERISTIC_UUID; // Store UUIDs
  }

  async requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
  }

  async scanForDevice() {
    await this.requestPermissions();
    console.log('BluetoothService: Initiating device scan...');
    return new Promise((resolve, reject) => {
      const devices = {}; // Use an object to store unique devices by ID
      const targetDeviceName = 'windtrax'; // Define the target device name (corrected to lowercase)

      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('BluetoothService: Scan error:', error);
          // Don't stop scan on error here, just log it
          return;
        }
        
        console.log('BluetoothService: Device discovered - Name:', device.name, 'ID:', device.id);

        // Only add devices that match the target name and haven't been added
        if (device && device.name === targetDeviceName && !devices[device.id]) {
           console.log('BluetoothService: Discovered target device:', device.name, device.id);
           devices[device.id] = device;
        }
      });
      
      // Stop scanning after 10 seconds and resolve with the list of found devices
      setTimeout(() => {
        this.bleManager.stopDeviceScan();
        console.log('BluetoothService: Scan stopped after 10 seconds.');
        console.log('BluetoothService: Found target devices:', Object.values(devices));
        resolve(Object.values(devices));
      }, 10000); // Scan for 10 seconds
    });
  }

  async connectToDevice(deviceId) {
    try {
      console.log(`BluetoothService: Attempting to connect to device with ID: ${deviceId}`);
      
      // Cancel any ongoing connection attempts
      await this.bleManager.cancelDeviceConnection(deviceId).catch(() => {});
      console.log(`BluetoothService: Cancelled any previous connection attempt for ID: ${deviceId}`);

      const device = await this.bleManager.connectToDevice(deviceId);
      console.log('BluetoothService: Connected to device successfully.');
      
      console.log('BluetoothService: Discovering services and characteristics...');
      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      console.log('BluetoothService: Discovered services and characteristics successfully.');
      
      this.device = device;
      this.isConnected = true;
      console.log('BluetoothService: Connection process completed.');
      return device;
    } catch (error) {
      console.error('BluetoothService: Connection error:', error);
      // Depending on the error, you might want to disconnect here as well
      if (this.device) {
        try { await this.device.cancelConnection(); } catch (e) { console.error('BluetoothService: Error during cleanup disconnect:', e); }
      }
      this.device = null;
      this.isConnected = false;
      throw error;
    }
  }

  async sendCommand(command) {
    if (!this.isConnected || !this.device) {
      throw new Error('Not connected to device');
    }

    try {
      // Based on the current Python script, it only reacts to the string '1'.
      // We will send '1' for now to test communication.
      // TODO: Update this logic and the Python script to handle different commands (on/off, speed)
      const commandToSend = '1'; // Hardcoded to match current Pi script expectation
      const base64Command = Buffer.from(commandToSend).toString('base64'); // BLE writes often require base64
      
      console.log(`BluetoothService: Attempting to write \'${commandToSend}\' (Base64: ${base64Command}) to characteristic ${this.characteristicUUID} on service ${this.serviceUUID}`);

      // Directly write to the known characteristic
      await this.device.writeCharacteristicWithResponseForService(
        this.serviceUUID,
        this.characteristicUUID,
        base64Command // Value must be Base64
      );
      
      console.log('BluetoothService: Command sent successfully.');

    } catch (error) {
      console.error('BluetoothService: Send command error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected && this.device) {
      try {
        await this.device.cancelConnection();
        this.device = null;
        this.isConnected = false;
        console.log('Disconnected from device');
      } catch (error) {
        console.error('Disconnect error:', error);
        throw error;
      }
    }
  }
}

export default new BluetoothService(); 