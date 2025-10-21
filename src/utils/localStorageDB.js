/**
 * LocalStorage tabanlı basit veritabanı yönetimi
 * Bu modül, verileri tarayıcının localStorage'ında JSON formatında saklar
 * İleride gerçek bir veritabanına geçiş için arayüz sağlar
 */

// Veri koleksiyonları için anahtarlar
const DB_KEYS = {
  HASTALAR: 'dis_klinigi_hastalar',
  KULLANICILAR: 'dis_klinigi_kullanicilar',
  AYARLAR: 'dis_klinigi_ayarlar'
};

// Veritabanı sürümü
const DB_VERSION = '1.0.0';

/**
 * Veritabanını başlat ve gerekli tabloları oluştur
 */
export const initDatabase = () => {
  // Hastalar tablosu
  if (!localStorage.getItem(DB_KEYS.HASTALAR)) {
    localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify([]));
  }

  // Kullanıcılar tablosu
  if (!localStorage.getItem(DB_KEYS.KULLANICILAR)) {
    // Varsayılan admin kullanıcısı
    const defaultAdmin = {
      id: 1,
      username: 'admin',
      password: 'admin123', // Gerçek uygulamada hash'lenmiş olmalı
      role: 'admin',
      name: 'Yönetici'
    };
    
    localStorage.setItem(DB_KEYS.KULLANICILAR, JSON.stringify([defaultAdmin]));
  }

  // Ayarlar tablosu
  if (!localStorage.getItem(DB_KEYS.AYARLAR)) {
    const defaultSettings = {
      version: DB_VERSION,
      createdAt: new Date().toISOString(),
      lastBackup: null
    };
    
    localStorage.setItem(DB_KEYS.AYARLAR, JSON.stringify(defaultSettings));
  }
};

/**
 * Tüm hastaları getir
 * @returns {Array} Hasta listesi
 */
export const getHastalar = () => {
  try {
    const data = localStorage.getItem(DB_KEYS.HASTALAR);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Hastalar verileri alınamadı:', error);
    return [];
  }
};

/**
 * Yeni hasta ekle
 * @param {Object} hasta - Eklenecek hasta bilgileri
 * @returns {Object} Eklenen hasta
 */
export const addHasta = (hasta) => {
  try {
    const hastalar = getHastalar();
    
    // Otomatik ID ataması
    const yeniHasta = {
      ...hasta,
      id: Date.now()
    };
    
    hastalar.push(yeniHasta);
    localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify(hastalar));
    
    return yeniHasta;
  } catch (error) {
    console.error('Hasta eklenemedi:', error);
    throw new Error('Hasta eklenirken bir hata oluştu');
  }
};

/**
 * Hasta bilgilerini güncelle
 * @param {number} id - Güncellenecek hastanın ID'si
 * @param {Object} yeniVeriler - Güncellenecek veriler
 * @returns {Object|null} Güncellenen hasta veya bulunamazsa null
 */
export const updateHasta = (id, yeniVeriler) => {
  try {
    const hastalar = getHastalar();
    const index = hastalar.findIndex(h => h.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const guncelHasta = {
      ...hastalar[index],
      ...yeniVeriler
    };
    
    hastalar[index] = guncelHasta;
    localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify(hastalar));
    
    return guncelHasta;
  } catch (error) {
    console.error('Hasta güncellenemedi:', error);
    throw new Error('Hasta güncellenirken bir hata oluştu');
  }
};

/**
 * Taksit ödemesi güncelle
 * @param {number} hastaId - Hastanın ID'si
 * @param {number} taksitId - Taksitin ID'si
 * @param {string} yeniDurum - Yeni ödeme durumu
 * @param {string} odemeSekli - Ödeme şekli
 * @returns {Object|null} Güncellenen hasta veya bulunamazsa null
 */
export const updateTaksitOdeme = (hastaId, taksitId, yeniDurum, odemeSekli) => {
  try {
    const hastalar = getHastalar();
    const hastaIndex = hastalar.findIndex(h => h.id === hastaId);
    
    if (hastaIndex === -1) {
      return null;
    }
    
    const hasta = hastalar[hastaIndex];
    const taksitIndex = hasta.taksitler.findIndex(t => t.id === taksitId);
    
    if (taksitIndex === -1) {
      return null;
    }
    
    // Taksiti güncelle
    const guncelTaksitler = [...hasta.taksitler];
    guncelTaksitler[taksitIndex] = {
      ...guncelTaksitler[taksitIndex],
      durum: yeniDurum,
      odemeSekli: odemeSekli || guncelTaksitler[taksitIndex].odemeSekli
    };
    
    // Kalan tutarı hesapla
    let kalanTutar = hasta.toplamTutar;
    guncelTaksitler.forEach(taksit => {
      if (taksit.durum === 'Ödendi') {
        kalanTutar -= taksit.tutar;
      }
    });
    
    // Hastayı güncelle
    const guncelHasta = {
      ...hasta,
      taksitler: guncelTaksitler,
      kalanTutar: kalanTutar
    };
    
    hastalar[hastaIndex] = guncelHasta;
    localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify(hastalar));
    
    return guncelHasta;
  } catch (error) {
    console.error('Taksit ödemesi güncellenemedi:', error);
    throw new Error('Taksit ödemesi güncellenirken bir hata oluştu');
  }
};

/**
 * Kullanıcı doğrulama
 * @param {string} username - Kullanıcı adı
 * @param {string} password - Şifre
 * @returns {Object|null} Kullanıcı bilgileri veya hatalı giriş durumunda null
 */
export const authenticateUser = (username, password) => {
  try {
    const kullanicilar = JSON.parse(localStorage.getItem(DB_KEYS.KULLANICILAR) || '[]');
    const kullanici = kullanicilar.find(
      k => k.username === username && k.password === password
    );
    
    if (kullanici) {
      // Şifreyi döndürme
      const { password, ...kullaniciBilgileri } = kullanici;
      return kullaniciBilgileri;
    }
    
    return null;
  } catch (error) {
    console.error('Kullanıcı doğrulama hatası:', error);
    return null;
  }
};

/**
 * Veritabanı yedeği al
 * @returns {Object} Tüm veritabanı verilerini içeren nesne
 */
export const exportDatabase = () => {
  try {
    const hastalar = JSON.parse(localStorage.getItem(DB_KEYS.HASTALAR) || '[]');
    const ayarlar = JSON.parse(localStorage.getItem(DB_KEYS.AYARLAR) || '{}');
    
    // Yedek alma tarihini güncelle
    ayarlar.lastBackup = new Date().toISOString();
    localStorage.setItem(DB_KEYS.AYARLAR, JSON.stringify(ayarlar));
    
    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      data: {
        hastalar,
        ayarlar
      }
    };
  } catch (error) {
    console.error('Veritabanı yedeği alınamadı:', error);
    throw new Error('Veritabanı yedeği alınırken bir hata oluştu');
  }
};

/**
 * Hasta sil
 * @param {number} id - Silinecek hastanın ID'si
 * @returns {boolean} İşlem başarılı ise true
 */
export const deleteHasta = (id) => {
  try {
    const hastalar = getHastalar();
    const index = hastalar.findIndex(h => h.id === id);
    
    if (index === -1) {
      return false;
    }
    
    hastalar.splice(index, 1);
    localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify(hastalar));
    
    return true;
  } catch (error) {
    console.error('Hasta silinemedi:', error);
    throw new Error('Hasta silinirken bir hata oluştu');
  }
};

/**
 * Veritabanı yedeğini içe aktar
 * @param {Object} backupData - İçe aktarılacak yedek verisi
 * @returns {boolean} İşlem başarılı ise true
 */
export const importDatabase = (backupData) => {
  try {
    if (!backupData || !backupData.data) {
      throw new Error('Geçersiz yedek verisi');
    }
    
    // Hastalar verisini içe aktar
    if (backupData.data.hastalar) {
      localStorage.setItem(DB_KEYS.HASTALAR, JSON.stringify(backupData.data.hastalar));
    }
    
    // Ayarlar verisini içe aktar (kullanıcılar hariç)
    if (backupData.data.ayarlar) {
      localStorage.setItem(DB_KEYS.AYARLAR, JSON.stringify({
        ...backupData.data.ayarlar,
        importDate: new Date().toISOString()
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Veritabanı yedeği içe aktarılamadı:', error);
    throw new Error('Veritabanı yedeği içe aktarılırken bir hata oluştu');
  }
};

// Veritabanını başlat
initDatabase();
