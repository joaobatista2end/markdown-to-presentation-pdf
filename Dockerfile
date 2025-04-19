FROM n8nio/n8n:latest

USER root

# Install Chromium and its dependencies
RUN apk add --no-cache \
    chromium \
    font-noto \
    font-noto-cjk \
    font-noto-extra \
    && rm -rf /var/cache/apk/*

# Install Marp CLI
RUN npm i -g @marp-team/marp-cli

# Set Chrome path and flags for Marp with increased timeout and memory settings
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV CHROME_LAUNCH_OPTIONS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-setuid-sandbox --timeout=120000 --max-old-space-size=8192"
ENV PUPPETEER_TIMEOUT=120000
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DEBUG="marp-cli:*"

# Create necessary directories
RUN mkdir -p /home/node/markdown /home/node/pdf && \
    chown -R node:node /home/node/markdown /home/node/pdf

VOLUME /home/node/.n8n

EXPOSE 5678