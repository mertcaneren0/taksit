/**
 * Kimlik doğrulama rotaları
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Giriş
router.post('/login', authController.login);

// Token yenileme
router.post('/refresh-token', authController.refreshToken);

// Çıkış (kimlik doğrulama gerektirir)
router.post('/logout', authenticate, authController.logout);

module.exports = router;
