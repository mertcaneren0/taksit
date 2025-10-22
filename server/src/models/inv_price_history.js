const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvPriceHistory = sequelize.define('InvPriceHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materialId: { type: DataTypes.INTEGER, allowNull: false, field: 'material_id' },
    supplierId: { type: DataTypes.INTEGER, allowNull: true, field: 'supplier_id' },
    unitCost: { type: DataTypes.DECIMAL(12, 4), allowNull: false, field: 'unit_cost' },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'TRY' },
    priceDate: { type: DataTypes.DATE, allowNull: false, field: 'price_date' },
    note: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'inv_price_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['material_id', 'price_date'] },
      { fields: ['supplier_id', 'price_date'] },
    ]
  });

  return InvPriceHistory;
};
