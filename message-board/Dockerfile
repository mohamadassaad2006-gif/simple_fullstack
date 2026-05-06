# Use Node.js 22+ with SQLite support
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (even though you have none, this creates node_modules)
RUN npm install

# Copy the rest of the application
COPY . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Set environment variables
ENV PORT=3000
ENV DB_PATH=/app/data/messages.db
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Create a volume for persistent database storage
VOLUME [ "/app/data" ]

# Run the app with experimental SQLite flag
CMD ["node", "--experimental-sqlite", "server.js"]