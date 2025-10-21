/**
 * EE Yönetim API Sunucusu
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Güvenlik başlıkları
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Loglama
app.use(express.json()); // JSON gövdesi ayrıştırma
app.use(express.urlencoded({ extended: true })); // URL-encoded gövdesi ayrıştırma

// API rotaları
app.use('/api', routes);

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    message: 'EE Yönetim API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 işleyici
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Hata işleyici
app.use(errorHandler);

// Sunucuyu başlat
const startServer = async () => {
  try {
    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');
    
    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken hata oluştu:', error);
    process.exit(1);
  }
};

startServer();


