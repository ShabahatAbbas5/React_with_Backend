# Use the official Node.js image as a base
FROM node:18-slim

# Install necessary dependencies for Chromium
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxss1 \
  libxtst6 \
  libgbm1 \
  libgtk-3-0 \
  && rm -rf /var/lib/apt/lists/*

# Install Chromium
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && dpkg -i google-chrome-stable_current_amd64.deb \
  && apt-get -f install -y

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express.js app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
