const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvLocation = sequelize.define('InvLocation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true, field: 'parent_id' },
    path: { type: DataTypes.STRING(500), allowNull: true },
  }, {
    tableName: 'inv_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InvLocation;
};
