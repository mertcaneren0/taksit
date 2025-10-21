/**
 * Kimlik doğrulama controller
 */

const jwt = require('jsonwebtoken');
const { Kullanici } = require('../models');

/**
 * Kullanıcı girişi
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Kullanıcıyı bul
    const kullanici = await Kullanici.findOne({
      where: { username }
    });
    
    // Kullanıcı yoksa veya şifre yanlışsa
    if (!kullanici || !(await kullanici.comparePassword(password))) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Geçersiz kullanıcı adı veya şifre.'
      });
    }
    
    // Token oluştur
    const token = jwt.sign(
      { id: kullanici.id, username: kullanici.username, role: kullanici.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Yenileme token'ı oluştur
    const refreshToken = jwt.sign(
      { id: kullanici.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    
    // Kullanıcı bilgilerini döndür
    res.json({
      user: {
        id: kullanici.id,
        username: kullanici.username,
        role: kullanici.role,
        name: kullanici.name
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Token yenileme
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Yenileme token\'ı gerekli.'
      });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const kullanici = await Kullanici.findByPk(decoded.id);
    
    if (!kullanici) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Geçersiz token.'
      });
    }
    
    // Yeni token oluştur
    const token = jwt.sign(
      { id: kullanici.id, username: kullanici.username, role: kullanici.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Yeni yenileme token'ı oluştur
    const newRefreshToken = jwt.sign(
      { id: kullanici.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    
    res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Geçersiz veya süresi dolmuş token.'
      });
    }
    next(error);
  }
};

/**
 * Çıkış
 */
exports.logout = (req, res) => {
  // JWT tabanlı kimlik doğrulamada, sunucu tarafında çıkış işlemi yoktur.
  // Token, istemci tarafında silinir.
  res.json({
    success: true,
    message: 'Başarıyla çıkış yapıldı.'
  });
};


