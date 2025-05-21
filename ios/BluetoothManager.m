#import <React/RCTBridgeModule.h>
#import <CoreBluetooth/CoreBluetooth.h>

@interface BluetoothManager : NSObject <RCTBridgeModule, CBCentralManagerDelegate, CBPeripheralDelegate>
@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, strong) CBPeripheral *peripheral;
@property (nonatomic, strong) NSMutableArray *discoveredDevices;
@end

@implementation BluetoothManager

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
        _discoveredDevices = [NSMutableArray array];
    }
    return self;
}

RCT_EXPORT_METHOD(scanForDevices:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (_centralManager.state != CBManagerStatePoweredOn) {
        reject(@"bluetooth_off", @"Bluetooth is not powered on", nil);
        return;
    }
    
    [_discoveredDevices removeAllObjects];
    [_centralManager scanForPeripheralsWithServices:nil options:nil];
    
    // Stop scanning after 10 seconds
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self->_centralManager stopScan];
        resolve(self->_discoveredDevices);
    });
}

RCT_EXPORT_METHOD(connectToDevice:(NSString *)deviceId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    CBPeripheral *peripheral = [self findPeripheralWithId:deviceId];
    if (peripheral) {
        _peripheral = peripheral;
        _peripheral.delegate = self;
        [_centralManager connectPeripheral:peripheral options:nil];
        resolve(@YES);
    } else {
        reject(@"device_not_found", @"Device not found", nil);
    }
}

RCT_EXPORT_METHOD(sendData:(NSString *)deviceId
                  data:(NSString *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!_peripheral) {
        reject(@"not_connected", @"Not connected to device", nil);
        return;
    }
    
    // Find the characteristic and send data
    for (CBService *service in _peripheral.services) {
        for (CBCharacteristic *characteristic in service.characteristics) {
            if (characteristic.properties & CBCharacteristicPropertyWrite) {
                NSData *dataToSend = [data dataUsingEncoding:NSUTF8StringEncoding];
                [_peripheral writeValue:dataToSend forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
                resolve(@YES);
                return;
            }
        }
    }
    reject(@"no_characteristic", @"No writable characteristic found", nil);
}

RCT_EXPORT_METHOD(disconnect:(NSString *)deviceId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (_peripheral) {
        [_centralManager cancelPeripheralConnection:_peripheral];
        _peripheral = nil;
        resolve(@YES);
    } else {
        reject(@"not_connected", @"Not connected to device", nil);
    }
}

#pragma mark - CBCentralManagerDelegate

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    // Handle Bluetooth state changes
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral
    advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI {
    NSDictionary *device = @{
        @"id": peripheral.identifier.UUIDString,
        @"name": peripheral.name ?: @"Unknown Device",
        @"rssi": RSSI
    };
    [_discoveredDevices addObject:device];
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    [peripheral discoverServices:nil];
}

#pragma mark - Helper Methods

- (CBPeripheral *)findPeripheralWithId:(NSString *)deviceId {
    for (CBPeripheral *peripheral in _centralManager.retrieveConnectedPeripheralsWithServices:@[]]) {
        if ([peripheral.identifier.UUIDString isEqualToString:deviceId]) {
            return peripheral;
        }
    }
    return nil;
}

@end 