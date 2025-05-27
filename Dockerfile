FROM node:18

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Fix execution permission for entrypoint
RUN chmod +x docker-entrypoint.sh

# Install dependencies
RUN npm install

# Start the app
ENTRYPOINT ["./docker-entrypoint.sh"]