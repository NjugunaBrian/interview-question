# ---------- Stage 1: Build stage ----------
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev if any needed for build)
RUN npm install

# Copy the rest of the app
COPY . .

# ---------- Stage 2: Production stage ----------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only required files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/index.js ./
COPY --from=build /app/db.js ./
COPY --from=build /app/redis.js ./
COPY --from=build /app/routes ./routes

# Install only production dependencies
RUN npm install --omit=dev

# Copy .env file (optional - can also use Docker secrets or Compose env)
COPY .env .env

# Expose app port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
