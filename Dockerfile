FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose the port (will be configurable via env var)
EXPOSE 3000

# Start the server using tsx (runs TypeScript directly)
CMD ["npm", "start"]