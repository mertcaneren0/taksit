/**
 * Taksit controller
 */

const { Hasta, Taksit } = require('../models');
const { sequelize } = require('../models');

/**
 * Taksit bilgilerini güncelle
 */
exports.updateTaksit = async (req, res, next) => {
  try {
    const { hastaId, taksitId } = req.params;
    const { tutar, tarih } = req.body;
    
    // Taksiti bul
    const taksit = await Taksit.findOne({
      where: {
        hastaId,
        taksitNo: taksitId
      }
    });
    
    if (!taksit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Taksit bulunamadı.'
      });
    }
    
    // Taksiti güncelle
    await taksit.update({
      tutar: tutar !== undefined ? tutar : taksit.tutar,
      tarih: tarih !== undefined ? tarih : taksit.tarih
    });
    
    // Hastanın toplam ve kalan tutarını güncelle
    const hasta = await Hasta.findByPk(hastaId);
    const taksitler = await Taksit.findAll({
      where: { hastaId }
    });
    
    const toplamTutar = taksitler.reduce((toplam, t) => toplam + parseFloat(t.tutar), 0);
    const odenenTaksitler = taksitler.filter(t => t.durum === 'Ödendi');
    const odenenTutar = odenenTaksitler.reduce((toplam, t) => toplam + parseFloat(t.tutar), 0);
    const kalanTutar = toplamTutar - odenenTutar;
    
    await hasta.update({
      toplamTutar,
      kalanTutar
    });
    
    // Güncellenmiş taksit ve hasta bilgilerini döndür
    const updatedTaksit = await Taksit.findOne({
      where: {
        hastaId,
        taksitNo: taksitId
      },
      include: [
        {
          model: Hasta,
          attributes: ['id', 'isim', 'soyisim', 'tcKimlikNo', 'toplamTutar', 'kalanTutar']
        }
      ]
    });
    
    res.json(updatedTaksit);
  } catch (error) {
    next(error);
  }
};

/**
 * Taksit ödemesi güncelle
 */
exports.updateTaksitOdeme = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { hastaId, taksitId } = req.params;
    const { durum, odemeSekli } = req.body;
    
    // Taksiti bul
    const taksit = await Taksit.findOne({
      where: {
        hastaId,
        taksitNo: taksitId
      },
      transaction
    });
    
    if (!taksit) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not Found',
        message: 'Taksit bulunamadı.'
      });
    }
    
    // Ödeme durumunu güncelle
    const odemeTarihi = durum === 'Ödendi' ? new Date() : null;
    
    await taksit.update({
      durum,
      odemeSekli: durum === 'Ödendi' ? odemeSekli : null,
      odemeTarihi
    }, { transaction });
    
    // Hastanın kalan tutarını ve son ödeme tarihini güncelle
    const hasta = await Hasta.findByPk(hastaId, { transaction });
    const taksitler = await Taksit.findAll({
      where: { hastaId },
      transaction
    });
    
    const odenenTaksitler = taksitler.filter(t => t.durum === 'Ödendi');
    const odenenTutar = odenenTaksitler.reduce((toplam, t) => toplam + parseFloat(t.tutar), 0);
    const kalanTutar = parseFloat(hasta.toplamTutar) - odenenTutar;
    
    // Son ödeme tarihini bul
    const sonOdemeTarihi = durum === 'Ödendi' ? new Date() : hasta.sonOdemeTarihi;
    
    await hasta.update({
      kalanTutar,
      sonOdemeTarihi
    }, { transaction });
    
    await transaction.commit();
    
    // Güncellenmiş taksit ve hasta bilgilerini döndür
    const updatedTaksit = await Taksit.findOne({
      where: {
        hastaId,
        taksitNo: taksitId
      },
      include: [
        {
          model: Hasta,
          attributes: ['id', 'isim', 'soyisim', 'tcKimlikNo', 'toplamTutar', 'kalanTutar', 'sonOdemeTarihi']
        }
      ]
    });
    
    res.json(updatedTaksit);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};


