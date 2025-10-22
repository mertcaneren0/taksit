/**
 * Kimlik doğrulama middleware
 */

const jwt = require('jsonwebtoken');
const { Kullanici } = require('../models');

/**
 * Token doğrulama middleware'i
 */
const authenticate = async (req, res, next) => {
  try {
    // Authorization başlığını kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Kimlik doğrulama gerekli.'
      });
    }

    // Token'ı çıkar
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token bulunamadı.'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const kullanici = await Kullanici.findByPk(decoded.id);
    if (!kullanici) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Kullanıcı bulunamadı.'
      });
    }

    // Kullanıcıyı request nesnesine ekle
    req.user = {
      id: kullanici.id,
      username: kullanici.username,
      role: kullanici.role,
      name: kullanici.name
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin rolü kontrolü
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Bu işlem için yetkiniz yok.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin
};



