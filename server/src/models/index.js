/**
 * Veritabanı modelleri
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Sequelize örneği oluştur
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
  }
);

// Modelleri yükle
const Hasta = require('./hasta')(sequelize);
const Taksit = require('./taksit')(sequelize);
const Kullanici = require('./kullanici')(sequelize);
const Ayarlar = require('./ayarlar')(sequelize);

// İlişkileri tanımla
Hasta.hasMany(Taksit, { foreignKey: 'hastaId', as: 'taksitler' });
Taksit.belongsTo(Hasta, { foreignKey: 'hastaId' });

// Modelleri dışa aktar
const models = {
  Hasta,
  Taksit,
  Kullanici,
  Ayarlar,
  sequelize,
};

module.exports = models;


