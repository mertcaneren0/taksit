/**
 * Hasta modeli
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hasta = sequelize.define('Hasta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tcKimlikNo: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      field: 'tc_kimlik_no',
      validate: {
        len: [11, 11],
        isNumeric: true,
      },
    },
    isim: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    soyisim: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefon: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    islem: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hekim: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    toplamTutar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'toplam_tutar',
    },
    kalanTutar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'kalan_tutar',
    },
    tedaviBaslangicTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'tedavi_baslangic_tarihi',
    },
    sonOdemeTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'son_odeme_tarihi',
    },
    odemeTipi: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'odeme_tipi',
    },
    not: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taksitSayisi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'taksit_sayisi',
    },
  }, {
    tableName: 'hastalar',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Hasta;
};
