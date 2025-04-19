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

# Set Chrome path for Marp
ENV CHROME_PATH=/usr/bin/chromium-browser

VOLUME /home/node/.n8n

USER node

EXPOSE 5678