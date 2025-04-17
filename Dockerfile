FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm i 

# Bundle app source
COPY . .

# Run migrations
CMD ["sh", "-c", "npm run run-migration && npm start"]

EXPOSE 3010
