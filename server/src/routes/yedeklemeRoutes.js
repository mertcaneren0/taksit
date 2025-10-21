/**
 * Yedekleme rotaları
 */

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const yedeklemeController = require('../controllers/yedeklemeController');

// Kimlik doğrulama middleware'ini uygula ve admin yetkisi iste
router.use(authenticate);
router.use(isAdmin);

// Veritabanı yedeği al
router.get('/export', yedeklemeController.exportDatabase);

// Veritabanı yedeğini içe aktar
router.post('/import', yedeklemeController.importDatabase);

module.exports = router;


