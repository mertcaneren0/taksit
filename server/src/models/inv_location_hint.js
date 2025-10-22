const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvLocationHint = sequelize.define('InvLocationHint', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    locationId: { type: DataTypes.INTEGER, allowNull: false, field: 'location_id' },
    hintText: { type: DataTypes.STRING(200), allowNull: false, field: 'hint_text' },
  }, {
    tableName: 'inv_location_hints',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['location_id', 'hint_text'] }
    ]
  });

  return InvLocationHint;
};
