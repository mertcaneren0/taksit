const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvOrderItem = sequelize.define('InvOrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
    materialId: { type: DataTypes.INTEGER, allowNull: false, field: 'material_id' },
    requestedQty: { type: DataTypes.DECIMAL(12, 3), allowNull: false, field: 'requested_qty' },
    note: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'inv_order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InvOrderItem;
};
