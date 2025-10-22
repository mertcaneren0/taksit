/**
 * Hasta rotaları
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const hastaController = require('../controllers/hastaController');
const taksitController = require('../controllers/taksitController');

// Kimlik doğrulama middleware'ini uygula
router.use(authenticate);

// Hasta rotaları
router.get('/', hastaController.getAllHastalar);
router.get('/:id', hastaController.getHastaById);
router.post('/', hastaController.createHasta);
router.put('/:id', hastaController.updateHasta);
router.delete('/:id', hastaController.deleteHasta);

// Taksit rotaları
router.put('/:hastaId/taksitler/:taksitId', taksitController.updateTaksit);
router.put('/:hastaId/taksitler/:taksitId/odeme', taksitController.updateTaksitOdeme);

module.exports = router;



