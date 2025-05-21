package com.fanapp;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class BluetoothAdapter extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private android.bluetooth.BluetoothAdapter bluetoothAdapter;
    private BluetoothGatt bluetoothGatt;
    private List<BluetoothDevice> discoveredDevices;

    public BluetoothAdapter(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        BluetoothManager bluetoothManager = (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        this.bluetoothAdapter = bluetoothManager.getAdapter();
        this.discoveredDevices = new ArrayList<>();
    }

    @Override
    public String getName() {
        return "BluetoothAdapter";
    }

    @ReactMethod
    public void scanForDevices(Promise promise) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            promise.reject("bluetooth_off", "Bluetooth is not enabled");
            return;
        }

        discoveredDevices.clear();
        bluetoothAdapter.startDiscovery();

        // Stop scanning after 10 seconds
        new android.os.Handler().postDelayed(() -> {
            bluetoothAdapter.cancelDiscovery();
            WritableArray devices = Arguments.createArray();
            for (BluetoothDevice device : discoveredDevices) {
                WritableMap deviceMap = Arguments.createMap();
                deviceMap.putString("id", device.getAddress());
                deviceMap.putString("name", device.getName() != null ? device.getName() : "Unknown Device");
                devices.pushMap(deviceMap);
            }
            promise.resolve(devices);
        }, 10000);
    }

    @ReactMethod
    public void connectToDevice(String deviceId, Promise promise) {
        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceId);
        if (device == null) {
            promise.reject("device_not_found", "Device not found");
            return;
        }

        bluetoothGatt = device.connectGatt(reactContext, false, new BluetoothGattCallback() {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    gatt.discoverServices();
                    promise.resolve(true);
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    promise.reject("connection_failed", "Failed to connect to device");
                }
            }
        });
    }

    @ReactMethod
    public void sendData(String deviceId, String data, Promise promise) {
        if (bluetoothGatt == null) {
            promise.reject("not_connected", "Not connected to device");
            return;
        }

        for (BluetoothGattService service : bluetoothGatt.getServices()) {
            for (BluetoothGattCharacteristic characteristic : service.getCharacteristics()) {
                if ((characteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_WRITE) != 0) {
                    characteristic.setValue(data.getBytes());
                    bluetoothGatt.writeCharacteristic(characteristic);
                    promise.resolve(true);
                    return;
                }
            }
        }
        promise.reject("no_characteristic", "No writable characteristic found");
    }

    @ReactMethod
    public void disconnect(String deviceId, Promise promise) {
        if (bluetoothGatt != null) {
            bluetoothGatt.disconnect();
            bluetoothGatt.close();
            bluetoothGatt = null;
            promise.resolve(true);
        } else {
            promise.reject("not_connected", "Not connected to device");
        }
    }
} 