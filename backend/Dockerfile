FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Use the start script from package.json
CMD ["npm", "start"]
