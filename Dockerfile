# frontend/Dockerfile

# Stage 1: build dengan Vite + Yarn
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package dan lockfile, install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source dan build
COPY . .
RUN yarn build

# Stage 2: serve statis dengan Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
