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
const inventoryRoutes = require('./inventoryRoutes');

// Rotaları kullan
router.use('/auth', authRoutes);
router.use('/hastalar', hastaRoutes);
router.use('/kullanicilar', kullaniciRoutes);
router.use('/ayarlar', ayarlarRoutes);
router.use('/yedekleme', yedeklemeRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;



