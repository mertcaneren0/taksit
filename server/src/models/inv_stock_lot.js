const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvStockLot = sequelize.define('InvStockLot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materialId: { type: DataTypes.INTEGER, allowNull: false, field: 'material_id' },
    locationId: { type: DataTypes.INTEGER, allowNull: false, field: 'location_id' },
    lotCode: { type: DataTypes.STRING(100), allowNull: true, field: 'lot_code' },
    expiryDate: { type: DataTypes.DATE, allowNull: true, field: 'expiry_date' },
    qty: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
    costLast: { type: DataTypes.DECIMAL(12, 4), allowNull: true, field: 'cost_last' },
  }, {
    tableName: 'inv_stock_lots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['material_id', 'location_id'] },
      { fields: ['expiry_date'] },
      { fields: ['lot_code'] },
    ]
  });

  return InvStockLot;
};
