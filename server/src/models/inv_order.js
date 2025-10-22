const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvOrder = sequelize.define('InvOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataTypes.ENUM('DRAFT', 'SENT', 'CLOSED'), allowNull: false, defaultValue: 'DRAFT' },
    note: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.STRING(100), allowNull: true, field: 'created_by' },
  }, {
    tableName: 'inv_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InvOrder;
};
