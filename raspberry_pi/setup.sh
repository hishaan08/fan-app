#!/bin/bash

# Update package lists
sudo apt-get update

# Install required system packages
sudo apt-get install -y python3-pip python3-dev bluez python3-dbus libdbus-1-dev libdbus-glib-1-dev \
    python3-gi python3-gi-cairo gir1.2-gtk-3.0 libgirepository1.0-dev libcairo2-dev pkg-config python3-dev \
    gir1.2-glib-2.0 python3-gobject

# Create virtual environment with system packages
python3 -m venv venv --system-site-packages
source venv/bin/activate

# Install Python packages
pip3 install --upgrade pip
pip3 install wheel setuptools
pip3 install dbus-python
pip3 install -r requirements.txt

# Enable Bluetooth
sudo bluetoothctl power on
sudo systemctl enable bluetooth
sudo systemctl start bluetooth

# Add user to bluetooth group
sudo usermod -a -G bluetooth $USER

echo "Setup complete! You can now run the fan controller with:"
echo "source venv/bin/activate"
echo "python3 fan_controller.py"
echo ""
echo "Note: You may need to log out and log back in for the group changes to take effect." 