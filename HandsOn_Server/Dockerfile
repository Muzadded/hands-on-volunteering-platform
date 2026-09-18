FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY server.js db.js ./
COPY routes ./routes
COPY middleware ./middleware
COPY utils ./utils
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
