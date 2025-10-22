/**
 * Hata işleyici middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Sequelize hata türlerini kontrol et
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Bu kayıt zaten mevcut.',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Foreign Key Constraint Error',
      message: 'İlişkili kayıt bulunamadı.'
    });
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Geçersiz token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token süresi doldu.'
    });
  }

  // Özel hata türleri
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message
    });
  }

  // Diğer hatalar
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Sunucu hatası oluştu.' 
      : err.message
  });
};

module.exports = errorHandler;



