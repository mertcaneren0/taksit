/**
 * Veritabanı kurulum scripti
 */

require('dotenv').config();
const { sequelize, Kullanici, Ayarlar } = require('../models');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  try {
    console.log('Veritabanı kurulumu başlatılıyor...');
    
    // Tabloları oluştur (sync)
    await sequelize.sync({ force: true });
    console.log('Tablolar oluşturuldu.');
    
    // Admin kullanıcısı oluştur
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    await Kullanici.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: 'Sistem Yöneticisi'
    });
    console.log('Admin kullanıcısı oluşturuldu.');
    
    // Ayarları oluştur
    await Ayarlar.create({
      klinikAdi: 'EE Diş Kliniği',
      version: '1.0.0'
    });
    console.log('Varsayılan ayarlar oluşturuldu.');
    
    console.log('Veritabanı kurulumu tamamlandı.');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı kurulumu sırasında hata oluştu:', error);
    process.exit(1);
  }
}

setupDatabase();



