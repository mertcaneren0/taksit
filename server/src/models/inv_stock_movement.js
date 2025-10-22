const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvStockMovement = sequelize.define('InvStockMovement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materialId: { type: DataTypes.INTEGER, allowNull: false, field: 'material_id' },
    type: { type: DataTypes.ENUM('IN', 'OUT', 'TRANSFER'), allowNull: false },
    sourceLocationId: { type: DataTypes.INTEGER, allowNull: true, field: 'source_location_id' },
    targetLocationId: { type: DataTypes.INTEGER, allowNull: true, field: 'target_location_id' },
    lotCode: { type: DataTypes.STRING(100), allowNull: true, field: 'lot_code' },
    expiryDate: { type: DataTypes.DATE, allowNull: true, field: 'expiry_date' },
    qty: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    supplierId: { type: DataTypes.INTEGER, allowNull: true, field: 'supplier_id' },
    note: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.STRING(100), allowNull: true, field: 'created_by' },
    correlationId: { type: DataTypes.STRING(100), allowNull: true, field: 'correlation_id' },
  }, {
    tableName: 'inv_stock_movements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['material_id', 'created_at'] },
      { fields: ['type'] },
      { fields: ['source_location_id', 'target_location_id'] },
    ]
  });

  return InvStockMovement;
};
