const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // define associations here
      Product.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      Product.hasMany(models.Inventory, {
        foreignKey: 'product_id',
        as: 'inventories'
      });
      
      // Association for purchase order items
      Product.hasMany(models.PurchaseOrderItem, {
        foreignKey: 'product_id',
        as: 'purchase_order_items'
      });
      
      // Association for sales order items
      Product.hasMany(models.SalesOrderItem, {
        foreignKey: 'product_id',
        as: 'sales_order_items'
      });
    }
  }
  
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING
    },
    subcategory: {
      type: DataTypes.STRING
    },
    unit_of_measure: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'each'
    },
    barcode: {
      type: DataTypes.STRING
    },
    brand: {
      type: DataTypes.STRING
    },
    model_number: {
      type: DataTypes.STRING
    },
    manufacturer: {
      type: DataTypes.STRING
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    weight_unit: {
      type: DataTypes.STRING
    },
    dimensions: {
      type: DataTypes.JSONB
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    max_stock_level: {
      type: DataTypes.INTEGER
    },
    reorder_point: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lead_time_days: {
      type: DataTypes.INTEGER
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_service: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_serialized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_batch_tracked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_perishable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    attributes: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    notes: {
      type: DataTypes.TEXT
    },
    created_by: {
      type: DataTypes.UUID
    },
    updated_by: {
      type: DataTypes.UUID
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['sku', 'tenant_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_active']
      }
    ]
  });
  
  return Product;
};