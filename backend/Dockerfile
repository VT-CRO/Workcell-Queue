# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the entire backend code
COPY . .

# Expose the backend port
EXPOSE 5000

# Run the backend server
CMD ["node", "server.js"]