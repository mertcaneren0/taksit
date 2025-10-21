/**
 * Ayarlar rotaları
 */

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const ayarlarController = require('../controllers/ayarlarController');

// Kimlik doğrulama middleware'ini uygula
router.use(authenticate);

// Ayarları getir
router.get('/', ayarlarController.getAyarlar);

// Ayarları güncelle (admin yetkisi gerektirir)
router.put('/', isAdmin, ayarlarController.updateAyarlar);

module.exports = router;


