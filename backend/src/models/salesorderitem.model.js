const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class SalesOrderItem extends Model {
    static associate(models) {
      SalesOrderItem.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' });
      SalesOrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  SalesOrderItem.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, { sequelize, modelName: 'SalesOrderItem', tableName: 'sales_order_items', underscored: true });
  return SalesOrderItem;
};
