/**
 * Ana router
 */

const express = require('express');
const router = express.Router();

// Alt rotaları içe aktar
const authRoutes = require('./authRoutes');
const hastaRoutes = require('./hastaRoutes');
const kullaniciRoutes = require('./kullaniciRoutes');
const ayarlarRoutes = require('./ayarlarRoutes');
const yedeklemeRoutes = require('./yedeklemeRoutes');

// Rotaları kullan
router.use('/auth', authRoutes);
router.use('/hastalar', hastaRoutes);
router.use('/kullanicilar', kullaniciRoutes);
router.use('/ayarlar', ayarlarRoutes);
router.use('/yedekleme', yedeklemeRoutes);

module.exports = router;


