/**
 * Veritabanı Şeması
 * 
 * Bu dosya, veritabanı şemasını tanımlar ve örnek verileri içerir.
 * PostgreSQL, MySQL veya MongoDB gibi gerçek bir veritabanına geçiş için kullanılabilir.
 */

/**
 * Hasta tablosu şeması
 * 
 * @typedef {Object} Hasta
 * @property {string} id - Benzersiz tanımlayıcı
 * @property {string} tcKimlikNo - TC Kimlik Numarası
 * @property {string} isim - Hasta adı
 * @property {string} soyisim - Hasta soyadı
 * @property {string} telefon - Telefon numarası
 * @property {string} [islem] - Yapılan işlem/tedavi
 * @property {string} [hekim] - Tedaviyi yapan hekim
 * @property {number} toplamTutar - Toplam tedavi tutarı
 * @property {number} kalanTutar - Kalan ödeme tutarı
 * @property {Date} [tedaviBaslangicTarihi] - Tedavi başlangıç tarihi
 * @property {Date} [sonOdemeTarihi] - Son ödeme tarihi
 * @property {string} [odemeTipi] - Ödeme şekli (Nakit, Kredi Kartı, EFT)
 * @property {string} [not] - Hasta ile ilgili notlar
 * @property {number} taksitSayisi - Toplam taksit sayısı
 * @property {Array<Taksit>} taksitler - Taksit bilgileri
 * @property {Date} createdAt - Oluşturulma tarihi
 * @property {Date} updatedAt - Son güncelleme tarihi
 */

/**
 * Taksit tablosu şeması
 * 
 * @typedef {Object} Taksit
 * @property {number} id - Taksit numarası
 * @property {string} hastaId - Hasta ID'si (ilişki)
 * @property {number} tutar - Taksit tutarı
 * @property {Date} tarih - Vade tarihi
 * @property {string} durum - Ödeme durumu (Ödendi, Ödenmedi, Gecikti)
 * @property {string} [odemeSekli] - Ödeme şekli (Nakit, Kredi Kartı, EFT)
 * @property {Date} [odemeTarihi] - Ödeme tarihi
 */

/**
 * Kullanıcı tablosu şeması
 * 
 * @typedef {Object} Kullanici
 * @property {string} id - Benzersiz tanımlayıcı
 * @property {string} username - Kullanıcı adı
 * @property {string} password - Şifre (hash'lenmiş)
 * @property {string} role - Rol (admin, user)
 * @property {string} name - Ad Soyad
 * @property {Date} createdAt - Oluşturulma tarihi
 * @property {Date} updatedAt - Son güncelleme tarihi
 */

/**
 * Ayarlar tablosu şeması
 * 
 * @typedef {Object} Ayarlar
 * @property {string} id - Benzersiz tanımlayıcı
 * @property {string} klinikAdi - Klinik adı
 * @property {string} adres - Klinik adresi
 * @property {string} telefon - Klinik telefonu
 * @property {string} email - Klinik e-posta adresi
 * @property {string} vergiNo - Vergi numarası
 * @property {string} vergiDairesi - Vergi dairesi
 * @property {string} version - Uygulama sürümü
 * @property {Date} lastBackup - Son yedekleme tarihi
 * @property {Date} updatedAt - Son güncelleme tarihi
 */

// PostgreSQL için örnek şema (SQL)
export const postgresSchema = `
-- Hastalar tablosu
CREATE TABLE hastalar (
  id SERIAL PRIMARY KEY,
  tc_kimlik_no VARCHAR(11) UNIQUE NOT NULL,
  isim VARCHAR(100) NOT NULL,
  soyisim VARCHAR(100) NOT NULL,
  telefon VARCHAR(20) NOT NULL,
  islem TEXT,
  hekim VARCHAR(100),
  toplam_tutar DECIMAL(10, 2) NOT NULL,
  kalan_tutar DECIMAL(10, 2) NOT NULL,
  tedavi_baslangic_tarihi DATE,
  son_odeme_tarihi DATE,
  odeme_tipi VARCHAR(50),
  not TEXT,
  taksit_sayisi INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taksitler tablosu
CREATE TABLE taksitler (
  id SERIAL PRIMARY KEY,
  hasta_id INTEGER REFERENCES hastalar(id) ON DELETE CASCADE,
  taksit_no INTEGER NOT NULL,
  tutar DECIMAL(10, 2) NOT NULL,
  tarih DATE NOT NULL,
  durum VARCHAR(20) NOT NULL DEFAULT 'Ödenmedi',
  odeme_sekli VARCHAR(50),
  odeme_tarihi DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcılar tablosu
CREATE TABLE kullanicilar (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ayarlar tablosu
CREATE TABLE ayarlar (
  id INTEGER PRIMARY KEY DEFAULT 1,
  klinik_adi VARCHAR(100),
  adres TEXT,
  telefon VARCHAR(20),
  email VARCHAR(100),
  vergi_no VARCHAR(20),
  vergi_dairesi VARCHAR(100),
  version VARCHAR(20),
  last_backup TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_hastalar_tc ON hastalar(tc_kimlik_no);
CREATE INDEX idx_taksitler_hasta_id ON taksitler(hasta_id);
CREATE INDEX idx_taksitler_tarih ON taksitler(tarih);
CREATE INDEX idx_taksitler_durum ON taksitler(durum);
`;

// MongoDB için örnek şema (NoSQL)
export const mongoSchema = {
  hasta: {
    tcKimlikNo: { type: String, required: true, unique: true },
    isim: { type: String, required: true },
    soyisim: { type: String, required: true },
    telefon: { type: String, required: true },
    islem: { type: String },
    hekim: { type: String },
    toplamTutar: { type: Number, required: true },
    kalanTutar: { type: Number, required: true },
    tedaviBaslangicTarihi: { type: Date },
    sonOdemeTarihi: { type: Date },
    odemeTipi: { type: String },
    not: { type: String },
    taksitSayisi: { type: Number, required: true },
    taksitler: [{
      id: { type: Number, required: true },
      tutar: { type: Number, required: true },
      tarih: { type: Date, required: true },
      durum: { type: String, required: true, default: 'Ödenmedi' },
      odemeSekli: { type: String },
      odemeTarihi: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  
  kullanici: {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  
  ayarlar: {
    klinikAdi: { type: String },
    adres: { type: String },
    telefon: { type: String },
    email: { type: String },
    vergiNo: { type: String },
    vergiDairesi: { type: String },
    version: { type: String },
    lastBackup: { type: Date },
    updatedAt: { type: Date, default: Date.now }
  }
};

export default {
  postgresSchema,
  mongoSchema
};


