from bluezero import localGATT
from gpiozero import PWMOutputDevice, DigitalOutputDevice
import json
from time import sleep
from signal import pause

# ------------------- GPIO Setup -------------------
R_EN = DigitalOutputDevice(23)
L_EN = DigitalOutputDevice(24)
RPWM = PWMOutputDevice(12, frequency=1000)
LPWM = PWMOutputDevice(13, frequency=1000)

def set_fan_speed(speed):
    """Set fan speed (0-100)"""
    try:
        if 0 <= speed <= 100:
            # Convert percentage to PWM value (0-1)
            pwm_value = speed / 100.0
            R_EN.on()
            L_EN.on()
            RPWM.value = pwm_value
            LPWM.value = 0.0
            print(f"Fan speed set to {speed}%")
        else:
            print("Invalid speed value")
    except Exception as e:
        print(f"Error setting fan speed: {e}")

def stop_fan():
    """Stop the fan"""
    try:
        RPWM.value = 0.0
        LPWM.value = 0.0
        R_EN.off()
        L_EN.off()
        print("Fan stopped")
    except Exception as e:
        print(f"Error stopping fan: {e}")

# ------------------- BLE Write Callback -------------------
def write_callback(value):
    print(f"📩 Received raw value: {value}")

    try:
        # Try to decode as JSON first
        decoded = value.decode('utf-8')
        print(f"📝 Decoded as UTF-8: {decoded}")
        
        try:
            command = json.loads(decoded)
            if 'speed' in command:
                set_fan_speed(command['speed'])
            elif 'power' in command:
                if command['power']:
                    set_fan_speed(60)  # Default to medium speed when turning on
                else:
                    stop_fan()
            return
        except json.JSONDecodeError:
            # If not JSON, try simple commands
            if decoded == '1':
                print("✅ Matched ASCII '1'")
                set_fan_speed(60)  # Default to medium speed
            elif decoded == '0':
                print("✅ Matched ASCII '0'")
                stop_fan()
            else:
                print("❌ Invalid command received")
    except Exception as e:
        print(f"Error processing command: {e}")

def main():
    try:
        # ------------------- BLE Setup -------------------
        # Create a GATT service
        service = localGATT.Service(
            '12345678-1234-5678-1234-56789ABCDEF0',
            primary=True
        )

        # Create a characteristic for receiving commands
        characteristic = localGATT.Characteristic(
            'abcdef01-1234-5678-1234-56789abcdef0',
            service,
            value=[],
            notifying=False,
            flags=['write'],
            write_callback=write_callback
        )

        # Add the characteristic to the service
        service.add_characteristic(characteristic)

        # Create and start the GATT server
        server = localGATT.GattServer()
        server.add_service(service)
        
        # Start advertising
        print("📡 Advertising as WindTrax...")
        server.start()
        pause()

    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Fatal error: {e}")
    finally:
        stop_fan()
        if 'server' in locals():
            server.stop()

if __name__ == "__main__":
    main() 