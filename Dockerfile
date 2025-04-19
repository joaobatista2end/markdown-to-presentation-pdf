FROM n8nio/n8n:latest

USER root

RUN npm i -g @marp-team/marp-cli@0.5.0

VOLUME /home/node/.n8n

USER node

EXPOSE 5678
