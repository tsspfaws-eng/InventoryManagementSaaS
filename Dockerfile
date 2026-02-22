# 1. Base image
FROM node:20-slim AS base
WORKDIR /app

# 2. Dependencies
COPY package*.json ./
RUN npm install

# 3. Build the app
COPY . .
# If using Next.js, ensure 'output: "standalone"' is in next.config.js
RUN npm run build

# 4. Production Runner
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
