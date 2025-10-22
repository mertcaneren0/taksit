/**
 * Taksit modeli
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Taksit = sequelize.define('Taksit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hastaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'hasta_id',
      references: {
        model: 'hastalar',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    taksitNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'taksit_no',
    },
    tutar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durum: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Ödenmedi',
      validate: {
        isIn: [['Ödendi', 'Ödenmedi', 'Gecikti']],
      },
    },
    odemeSekli: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'odeme_sekli',
    },
    odemeTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'odeme_tarihi',
    },
  }, {
    tableName: 'taksitler',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Taksit;
};



