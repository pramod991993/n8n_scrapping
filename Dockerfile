FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && \
    apt-get install -y \
      gconf-service \
      libasound2 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdbus-1-3 \
      libgconf-2-4 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libx11-xcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxss1 \
      libxtst6 \
      ca-certificates \
      fonts-liberation \
      libappindicator3-1 \
      libxkbcommon0 \
      lsb-release \
      xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Install Node.js deps
RUN npm install

# Entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
