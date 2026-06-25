FROM node:18-bullseye-slim

WORKDIR /app
COPY package*.json ./
RUN npm install

# Menginstal FFmpeg untuk transcoding video di latar belakang
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
