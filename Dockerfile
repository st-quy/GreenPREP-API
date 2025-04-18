# Stage 1: Build stage
FROM node:20.19-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Remove unnecessary files from build
RUN rm -rf \
    *.md \
    .git \
    .env \
    etc \
    seeders \
    migrations
# Stage 2: Production image
FROM node:20.19-alpine

WORKDIR /app

COPY --from=build /app ./

RUN chmod +x entrypoint.sh

EXPOSE 3010

ENTRYPOINT ["./entrypoint.sh"]
