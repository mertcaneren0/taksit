const express = require('express');
const router = express.Router();

// NOT: Şimdilik iskelet uçlar, boş veri döner. Veritabanı şeması sonrası doldurulacak.

// Özet uyarılar: kritik stok ve SKT yaklaşan sayıları
router.get('/alerts/summary', async (req, res) => {
  return res.json({ criticalCount: 0, expiryCount: 0 });
});

// Malzeme ana liste (filtre/sıralama ileride eklenecek)
router.get('/materials', async (req, res) => {
  return res.json([]);
});

// Malzeme detay (özet)
router.get('/materials/:id', async (req, res) => {
  return res.json({ id: req.params.id });
});

// Fiyat geçmişi
router.get('/materials/:id/price-history', async (req, res) => {
  return res.json([]);
});

// Stok lotları
router.get('/materials/:id/stock-lots', async (req, res) => {
  return res.json([]);
});

// Hareketler
router.get('/materials/:id/movements', async (req, res) => {
  return res.json([]);
});

// Sipariş listesi
router.get('/orders', async (req, res) => {
  return res.json([]);
});

// Sipariş oluşturma
router.post('/orders', async (req, res) => {
  return res.status(201).json({ id: 1, status: 'DRAFT' });
});

// Stok Girişi (IN) - iskelet
router.post('/stock/in', async (req, res) => {
  const { materialName, materialId, location, locationId, qty, supplierId, lotCode, expiryDate, cost } = req.body || {};
  if (!materialName && !materialId) {
    return res.status(400).json({ message: 'Malzeme adı veya ID gerekli.' });
  }
  if (!location && !locationId) {
    return res.status(400).json({ message: 'Konum veya Konum ID gerekli.' });
  }
  if (!qty || Number(qty) <= 0) {
    return res.status(400).json({ message: 'Miktar pozitif olmalıdır.' });
  }
  // Şimdilik geriye basit bir yanıt döndür.
  return res.status(201).json({
    ok: true,
    movement: {
      type: 'IN',
      materialName, materialId,
      location, locationId,
      qty: Number(qty),
      supplierId: supplierId ?? null,
      lotCode: lotCode ?? null,
      expiryDate: expiryDate ?? null,
      cost: cost ? Number(cost) : null,
      created_at: new Date().toISOString(),
    }
  });
});

module.exports = router;
