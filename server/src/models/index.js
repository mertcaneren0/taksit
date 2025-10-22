/**
 * Veritabanı modelleri
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Sequelize örneği oluştur
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
  }
);

// Modelleri yükle
const Hasta = require('./hasta')(sequelize);
const Taksit = require('./taksit')(sequelize);
const Kullanici = require('./kullanici')(sequelize);
const Ayarlar = require('./ayarlar')(sequelize);
// Envanter modelleri
const InvMaterial = require('./inv_material')(sequelize);
const InvSupplier = require('./inv_supplier')(sequelize);
const InvLocation = require('./inv_location')(sequelize);
const InvLocationHint = require('./inv_location_hint')(sequelize);
const InvMaterialLocationThreshold = require('./inv_material_location_threshold')(sequelize);
const InvStockLot = require('./inv_stock_lot')(sequelize);
const InvStockMovement = require('./inv_stock_movement')(sequelize);
const InvPriceHistory = require('./inv_price_history')(sequelize);
const InvOrder = require('./inv_order')(sequelize);
const InvOrderItem = require('./inv_order_item')(sequelize);

// İlişkileri tanımla
Hasta.hasMany(Taksit, { foreignKey: 'hastaId', as: 'taksitler' });
Taksit.belongsTo(Hasta, { foreignKey: 'hastaId' });

// Envanter ilişkileri
InvMaterial.hasMany(InvStockLot, { foreignKey: 'material_id', as: 'stockLots' });
InvStockLot.belongsTo(InvMaterial, { foreignKey: 'material_id' });

InvLocation.hasMany(InvStockLot, { foreignKey: 'location_id', as: 'stockLots' });
InvStockLot.belongsTo(InvLocation, { foreignKey: 'location_id' });

InvLocation.hasMany(InvLocationHint, { foreignKey: 'location_id', as: 'hints' });
InvLocationHint.belongsTo(InvLocation, { foreignKey: 'location_id' });

InvMaterial.hasMany(InvMaterialLocationThreshold, { foreignKey: 'material_id', as: 'locationThresholds' });
InvMaterialLocationThreshold.belongsTo(InvMaterial, { foreignKey: 'material_id' });
InvLocation.hasMany(InvMaterialLocationThreshold, { foreignKey: 'location_id', as: 'materialThresholds' });
InvMaterialLocationThreshold.belongsTo(InvLocation, { foreignKey: 'location_id' });

InvMaterial.hasMany(InvStockMovement, { foreignKey: 'material_id', as: 'movements' });
InvStockMovement.belongsTo(InvMaterial, { foreignKey: 'material_id' });
InvSupplier.hasMany(InvStockMovement, { foreignKey: 'supplier_id', as: 'movements' });
InvStockMovement.belongsTo(InvSupplier, { foreignKey: 'supplier_id' });
InvLocation.hasMany(InvStockMovement, { foreignKey: 'source_location_id', as: 'sourceMovements' });
InvLocation.hasMany(InvStockMovement, { foreignKey: 'target_location_id', as: 'targetMovements' });
InvStockMovement.belongsTo(InvLocation, { foreignKey: 'source_location_id', as: 'sourceLocation' });
InvStockMovement.belongsTo(InvLocation, { foreignKey: 'target_location_id', as: 'targetLocation' });

InvMaterial.hasMany(InvPriceHistory, { foreignKey: 'material_id', as: 'priceHistory' });
InvPriceHistory.belongsTo(InvMaterial, { foreignKey: 'material_id' });
InvSupplier.hasMany(InvPriceHistory, { foreignKey: 'supplier_id', as: 'priceHistory' });
InvPriceHistory.belongsTo(InvSupplier, { foreignKey: 'supplier_id' });

InvOrder.hasMany(InvOrderItem, { foreignKey: 'order_id', as: 'items' });
InvOrderItem.belongsTo(InvOrder, { foreignKey: 'order_id' });
InvMaterial.hasMany(InvOrderItem, { foreignKey: 'material_id', as: 'orderItems' });
InvOrderItem.belongsTo(InvMaterial, { foreignKey: 'material_id' });

// Modelleri dışa aktar
const models = {
  Hasta,
  Taksit,
  Kullanici,
  Ayarlar,
  InvMaterial,
  InvSupplier,
  InvLocation,
  InvLocationHint,
  InvMaterialLocationThreshold,
  InvStockLot,
  InvStockMovement,
  InvPriceHistory,
  InvOrder,
  InvOrderItem,
  sequelize,
};

module.exports = models;



