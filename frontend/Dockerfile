# --------------------------
# Stage 1 — Build React App
# --------------------------
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # creates dist/ folder

# --------------------------
# Stage 2 — NGINX server
# --------------------------
FROM nginx:stable-alpine

# Copy built app to nginx HTML folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config (we will create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
