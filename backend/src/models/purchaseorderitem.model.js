const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class PurchaseOrderItem extends Model {
    static associate(models) {
      PurchaseOrderItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchase_order_id' });
      PurchaseOrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  PurchaseOrderItem.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, { sequelize, modelName: 'PurchaseOrderItem', tableName: 'purchase_order_items', underscored: true });
  return PurchaseOrderItem;
};
