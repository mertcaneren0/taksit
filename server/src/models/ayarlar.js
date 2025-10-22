/**
 * Ayarlar modeli
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ayarlar = sequelize.define('Ayarlar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    klinikAdi: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'klinik_adi',
    },
    adres: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telefon: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    vergiNo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'vergi_no',
    },
    vergiDairesi: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'vergi_dairesi',
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    lastBackup: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_backup',
    },
  }, {
    tableName: 'ayarlar',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  });

  return Ayarlar;
};



