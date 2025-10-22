const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvSupplier = sequelize.define('InvSupplier', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'inv_suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InvSupplier;
};
