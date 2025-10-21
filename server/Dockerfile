# Node.js API Sunucusu için Dockerfile

# Node.js 20 imajını kullan
FROM node:20-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --production

# Kaynak kodları kopyala
COPY . .

# Çalışma zamanı ortam değişkenleri
ENV NODE_ENV=production
ENV PORT=3001

# 3001 portunu aç
EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "src/index.js"]


