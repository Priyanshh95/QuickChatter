# --- Stage 1: build the React client ---
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: server runtime ---
FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# App code + built client
COPY server ./server
COPY --from=client /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server/src/index.js"]
