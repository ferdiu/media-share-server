FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY media-share-server.js ./

# Create media directory
RUN mkdir -p /media

# Set environment variables
ENV PORT=1337
ENV MEDIA_DIR=/media
ENV NODE_ENV=production

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user
USER node

# Start the application
CMD ["node", "media-share-server.js"]