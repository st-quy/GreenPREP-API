FROM node:20.19-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm i 

# Bundle app source
COPY . .

# Add entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Run migrations
# CMD ["sh", "-c", "npm run run-migration && npm start"]

EXPOSE 3010

ENTRYPOINT ["./entrypoint.sh"]