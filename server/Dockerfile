# Base image Node
FROM node:24-alpine

# Working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose the port Express listens on
EXPOSE 4000

# Default command
CMD ["npm", "run", "start"]