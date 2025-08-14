#!/bin/bash

set -e

echo "Systempakete installieren..."
sudo apt-get update

sudo apt-get install -y \
    python3-gi \
    python3-gi-cairo \
    gir1.2-glib-2.0 \
    libdbus-1-dev \
    libdbus-glib-1-dev \
    python3-rpi.gpio \
    python3-pip \
    python3-setuptools \
    unclutter

echo "Systempakete wurden installiert."

echo "Python-Pakete installieren..."

pip3 install --user --upgrade pip setuptools

pip3 install --user \
    flask \
    flask-cors \
    adafruit-circuitpython-dht \
    adafruit-blinka \
    pyalsaaudio \
    pydbus \
    pillow \
    RPi.GPIO

echo "Python-Pakete wurden installiert."

echo "Installation abgeschlossen!"
