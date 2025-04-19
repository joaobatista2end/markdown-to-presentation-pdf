FROM n8nio/n8n:latest

USER root

# Install Chromium and its dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Marp CLI
RUN npm i -g @marp-team/marp-cli@0.5.0

# Set Chrome path for Marp
ENV CHROME_PATH=/usr/bin/chromium

VOLUME /home/node/.n8n

USER node

EXPOSE 5678