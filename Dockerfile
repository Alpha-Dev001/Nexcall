# Use Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create .env file for production
RUN echo "NODE_ENV=production" > .env

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
