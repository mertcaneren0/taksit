/**
 * Hasta controller
 */

const { Hasta, Taksit } = require('../models');
const { Op } = require('sequelize');

/**
 * Tüm hastaları getir
 */
exports.getAllHastalar = async (req, res, next) => {
  try {
    // Filtreleme parametreleri
    const { search, sortBy, sortOrder } = req.query;
    
    // Filtreleme koşulları
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { tcKimlikNo: { [Op.like]: `%${search}%` } },
        { isim: { [Op.like]: `%${search}%` } },
        { soyisim: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Sıralama
    const order = [];
    if (sortBy) {
      order.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['updatedAt', 'DESC']);
    }
    
    // Hastaları getir
    const hastalar = await Hasta.findAll({
      where: whereClause,
      include: [
        {
          model: Taksit,
          as: 'taksitler',
          required: false
        }
      ],
      order
    });
    
    res.json(hastalar);
  } catch (error) {
    next(error);
  }
};

/**
 * Hasta detaylarını getir
 */
exports.getHastaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hasta = await Hasta.findByPk(id, {
      include: [
        {
          model: Taksit,
          as: 'taksitler',
          required: false
        }
      ]
    });
    
    if (!hasta) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hasta bulunamadı.'
      });
    }
    
    res.json(hasta);
  } catch (error) {
    next(error);
  }
};

/**
 * Yeni hasta oluştur
 */
exports.createHasta = async (req, res, next) => {
  try {
    const {
      tcKimlikNo,
      isim,
      soyisim,
      telefon,
      islem,
      hekim,
      toplamTutar,
      kalanTutar,
      tedaviBaslangicTarihi,
      sonOdemeTarihi,
      odemeTipi,
      not,
      taksitSayisi,
      taksitler
    } = req.body;
    
    // TC Kimlik No kontrolü
    const existingHasta = await Hasta.findOne({
      where: { tcKimlikNo }
    });
    
    if (existingHasta) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Bu TC Kimlik Numarası ile kayıtlı hasta bulunmaktadır.'
      });
    }
    
    // Hasta oluştur
    const yeniHasta = await Hasta.create({
      tcKimlikNo,
      isim,
      soyisim,
      telefon,
      islem,
      hekim,
      toplamTutar,
      kalanTutar,
      tedaviBaslangicTarihi,
      sonOdemeTarihi,
      odemeTipi,
      not,
      taksitSayisi
    });
    
    // Taksitleri oluştur
    if (taksitler && taksitler.length > 0) {
      const taksitPromises = taksitler.map(taksit => {
        return Taksit.create({
          hastaId: yeniHasta.id,
          taksitNo: taksit.id,
          tutar: taksit.tutar,
          tarih: taksit.tarih,
          durum: taksit.durum || 'Ödenmedi'
        });
      });
      
      await Promise.all(taksitPromises);
    }
    
    // Oluşturulan hastayı taksitleriyle birlikte getir
    const createdHasta = await Hasta.findByPk(yeniHasta.id, {
      include: [
        {
          model: Taksit,
          as: 'taksitler',
          required: false
        }
      ]
    });
    
    res.status(201).json(createdHasta);
  } catch (error) {
    next(error);
  }
};

/**
 * Hasta bilgilerini güncelle
 */
exports.updateHasta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      tcKimlikNo,
      isim,
      soyisim,
      telefon,
      islem,
      hekim,
      toplamTutar,
      kalanTutar,
      tedaviBaslangicTarihi,
      sonOdemeTarihi,
      odemeTipi,
      not,
      taksitSayisi,
      taksitler
    } = req.body;
    
    // Hastayı bul
    const hasta = await Hasta.findByPk(id);
    
    if (!hasta) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hasta bulunamadı.'
      });
    }
    
    // TC Kimlik No değiştiyse, benzersiz olduğunu kontrol et
    if (tcKimlikNo && tcKimlikNo !== hasta.tcKimlikNo) {
      const existingHasta = await Hasta.findOne({
        where: { tcKimlikNo }
      });
      
      if (existingHasta) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Bu TC Kimlik Numarası ile kayıtlı başka bir hasta bulunmaktadır.'
        });
      }
    }
    
    // Hastayı güncelle
    await hasta.update({
      tcKimlikNo: tcKimlikNo || hasta.tcKimlikNo,
      isim: isim || hasta.isim,
      soyisim: soyisim || hasta.soyisim,
      telefon: telefon || hasta.telefon,
      islem: islem !== undefined ? islem : hasta.islem,
      hekim: hekim !== undefined ? hekim : hasta.hekim,
      toplamTutar: toplamTutar !== undefined ? toplamTutar : hasta.toplamTutar,
      kalanTutar: kalanTutar !== undefined ? kalanTutar : hasta.kalanTutar,
      tedaviBaslangicTarihi: tedaviBaslangicTarihi !== undefined ? tedaviBaslangicTarihi : hasta.tedaviBaslangicTarihi,
      sonOdemeTarihi: sonOdemeTarihi !== undefined ? sonOdemeTarihi : hasta.sonOdemeTarihi,
      odemeTipi: odemeTipi !== undefined ? odemeTipi : hasta.odemeTipi,
      not: not !== undefined ? not : hasta.not,
      taksitSayisi: taksitSayisi !== undefined ? taksitSayisi : hasta.taksitSayisi
    });
    
    // Taksitleri güncelle
    if (taksitler && taksitler.length > 0) {
      // Mevcut taksitleri getir
      const mevcutTaksitler = await Taksit.findAll({
        where: { hastaId: id }
      });
      
      // Taksitleri güncelle veya oluştur
      for (const taksit of taksitler) {
        const mevcutTaksit = mevcutTaksitler.find(t => t.taksitNo === taksit.id);
        
        if (mevcutTaksit) {
          // Mevcut taksiti güncelle
          await mevcutTaksit.update({
            tutar: taksit.tutar,
            tarih: taksit.tarih,
            durum: taksit.durum || mevcutTaksit.durum,
            odemeSekli: taksit.odemeSekli || mevcutTaksit.odemeSekli,
            odemeTarihi: taksit.odemeTarihi || mevcutTaksit.odemeTarihi
          });
        } else {
          // Yeni taksit oluştur
          await Taksit.create({
            hastaId: id,
            taksitNo: taksit.id,
            tutar: taksit.tutar,
            tarih: taksit.tarih,
            durum: taksit.durum || 'Ödenmedi',
            odemeSekli: taksit.odemeSekli,
            odemeTarihi: taksit.odemeTarihi
          });
        }
      }
      
      // Silinmesi gereken taksitleri belirle ve sil
      const taksitNolari = taksitler.map(t => t.id);
      for (const mevcutTaksit of mevcutTaksitler) {
        if (!taksitNolari.includes(mevcutTaksit.taksitNo)) {
          await mevcutTaksit.destroy();
        }
      }
    }
    
    // Güncellenen hastayı taksitleriyle birlikte getir
    const updatedHasta = await Hasta.findByPk(id, {
      include: [
        {
          model: Taksit,
          as: 'taksitler',
          required: false
        }
      ]
    });
    
    res.json(updatedHasta);
  } catch (error) {
    next(error);
  }
};

/**
 * Hasta sil
 */
exports.deleteHasta = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hasta = await Hasta.findByPk(id);
    
    if (!hasta) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Hasta bulunamadı.'
      });
    }
    
    // İlişkili taksitleri de sil (cascade)
    await hasta.destroy();
    
    res.json({
      success: true,
      message: 'Hasta başarıyla silindi.'
    });
  } catch (error) {
    next(error);
  }
};



