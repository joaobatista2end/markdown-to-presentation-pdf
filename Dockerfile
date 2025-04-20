FROM node:18-alpine

USER root

# Install Chromium and its dependencies
RUN apk add --no-cache \
    chromium \
    font-noto \
    font-noto-cjk \
    font-noto-extra \
    && rm -rf /var/cache/apk/*

RUN which chromium-browser

# Set Chrome path and flags for Marp with increased timeout and memory settings
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV CHROME_LAUNCH_OPTIONS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-setuid-sandbox --timeout=120000 --max-old-space-size=8192"
ENV PUPPETEER_TIMEOUT=120000
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DEBUG="marp-cli:*"

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p /tmp/markdown /tmp/pdf && \
    chown -R node:node /tmp/markdown /tmp/pdf /usr/src/app

USER node

EXPOSE 3000

CMD [ "node", "server.js" ] 