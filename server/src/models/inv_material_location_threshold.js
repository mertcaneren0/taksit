const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvMaterialLocationThreshold = sequelize.define('InvMaterialLocationThreshold', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    materialId: { type: DataTypes.INTEGER, allowNull: false, field: 'material_id' },
    locationId: { type: DataTypes.INTEGER, allowNull: false, field: 'location_id' },
    criticalQty: { type: DataTypes.DECIMAL(12, 3), allowNull: false, field: 'critical_qty' },
  }, {
    tableName: 'inv_material_location_thresholds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['material_id', 'location_id'] }
    ]
  });

  return InvMaterialLocationThreshold;
};
