#!/bin/bash

# Update package list and install necessary dependencies
apt-get update
apt-get install -y \
  wget \
  gnupg \
  libx11-dev \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxss1 \
  libxtst6 \
  libnss3 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libgbm-dev \
  --no-install-recommends

# Download and install Chromium
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome-stable_current_amd64.deb
apt-get -f install -y
rm google-chrome-stable_current_amd64.deb

# Install Node.js dependencies
npm install
