# ─────────────────────────────────────────
# STAGE 1: Build the React app
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching!)
# If package.json unchanged → skip npm ci
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy rest of source code
COPY . .

# Build the app (creates /app/dist folder)
RUN npm run build

# ─────────────────────────────────────────
# STAGE 2: Serve with Nginx
# Much smaller final image!
# ─────────────────────────────────────────
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]