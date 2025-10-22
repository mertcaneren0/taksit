const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvMaterial = sequelize.define('InvMaterial', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    brand: { type: DataTypes.STRING(100), allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    unit: { type: DataTypes.STRING(50), allowNull: false },
    criticalGlobal: { type: DataTypes.DECIMAL(12, 3), allowNull: true, field: 'critical_global' },
  }, {
    tableName: 'inv_materials',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InvMaterial;
};
