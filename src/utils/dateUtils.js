/**
 * Tarih işlemleri için yardımcı fonksiyonlar
 */

/**
 * Tarih formatını düzenleme
 * @param {Date|string} date - Tarih nesnesi veya tarih string'i
 * @returns {string} - Formatlanmış tarih string'i
 */
export const formatTarih = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('tr-TR');
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param {Date|string} date1 - İlk tarih
 * @param {Date|string} date2 - İkinci tarih
 * @returns {number} - Gün farkı
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Tarihin bugünden önce olup olmadığını kontrol eder
 * @param {Date|string} date - Kontrol edilecek tarih
 * @returns {boolean} - Tarih bugünden önceyse true, değilse false
 */
export const isDateInPast = (date) => {
  if (!date) return false;
  
  // Bugünün başlangıcı (saat 00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  
  return checkDate < today;
};

/**
 * Tarihin bugünden sonraki belirtilen gün sayısı içinde olup olmadığını kontrol eder
 * @param {Date|string} date - Kontrol edilecek tarih
 * @param {number} days - Gün sayısı
 * @returns {boolean} - Tarih belirtilen gün sayısı içindeyse true, değilse false
 */
export const isDateWithinDays = (date, days) => {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  const checkDate = new Date(date);
  
  return checkDate >= today && checkDate <= futureDate;
};

/**
 * Taksitlerin durumunu kontrol eder ve geçmiş tarihli taksitleri "Gecikti" olarak işaretler
 * @param {Array} taksitler - Taksit listesi
 * @returns {Array} - Güncellenen taksit listesi
 */
export const updateTaksitDurumlari = (taksitler) => {
  if (!taksitler || !Array.isArray(taksitler)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return taksitler.map(taksit => {
    // Eğer taksit zaten ödendiyse durumu değiştirme
    if (taksit.durum === 'Ödendi') return taksit;
    
    const taksitTarihi = new Date(taksit.tarih);
    taksitTarihi.setHours(0, 0, 0, 0);
    
    // Taksit tarihi bugünden önceyse ve ödenmemişse "Gecikti" olarak işaretle
    if (taksitTarihi < today) {
      return { ...taksit, durum: 'Gecikti' };
    }
    
    return taksit;
  });
};

/**
 * Hastanın taksitlerini kontrol eder ve geçmiş tarihli taksitleri "Gecikti" olarak işaretler
 * @param {Object} hasta - Hasta nesnesi
 * @returns {Object} - Güncellenen hasta nesnesi
 */
export const updateHastaTaksitDurumlari = (hasta) => {
  if (!hasta || !hasta.taksitler) return hasta;
  
  const guncelTaksitler = updateTaksitDurumlari(hasta.taksitler);
  
  return {
    ...hasta,
    taksitler: guncelTaksitler
  };
};


