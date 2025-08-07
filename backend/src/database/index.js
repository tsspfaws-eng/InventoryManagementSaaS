const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
  }
);

// Import models
const models = {
  Tenant: require('../models/tenant.model')(sequelize),
  User: require('../models/user.model')(sequelize),
  Product: require('../models/product.model')(sequelize),
  Inventory: require('../models/inventory.model')(sequelize),
  Warehouse: require('../models/warehouse.model')(sequelize),
  InventoryTransaction: require('../models/inventoryTransaction.model')(sequelize),
  PurchaseOrder: require('../models/purchaseOrder.model')(sequelize),
  SalesOrder: require('../models/salesOrder.model')(sequelize),
};

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};