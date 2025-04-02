# Use an official Node.js runtime as a parent image
FROM node:22 as build

WORKDIR /app/

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

