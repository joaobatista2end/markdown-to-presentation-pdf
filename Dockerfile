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
RUN npm i -g @marp-team/marp-cli@0.5.0

# Set Chrome path and flags for Marp with increased timeout and memory settings
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV CHROME_LAUNCH_OPTIONS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-setuid-sandbox --timeout=60000 --max-old-space-size=4096"
ENV PUPPETEER_TIMEOUT=60000
ENV NODE_OPTIONS="--max-old-space-size=4096"

VOLUME /home/node/.n8n

USER node

EXPOSE 5678