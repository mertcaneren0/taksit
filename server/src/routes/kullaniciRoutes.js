/**
 * Kullanıcı rotaları
 */

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const kullaniciController = require('../controllers/kullaniciController');

// Kimlik doğrulama middleware'ini uygula
router.use(authenticate);

// Admin yetkisi gerektiren rotalar
router.get('/', isAdmin, kullaniciController.getAllKullanicilar);
router.post('/', isAdmin, kullaniciController.createKullanici);
router.get('/:id', isAdmin, kullaniciController.getKullaniciById);
router.put('/:id', isAdmin, kullaniciController.updateKullanici);
router.delete('/:id', isAdmin, kullaniciController.deleteKullanici);

// Kullanıcının kendi bilgilerini güncellemesi
router.put('/profile/update', kullaniciController.updateProfile);
router.put('/profile/password', kullaniciController.updatePassword);

module.exports = router;


