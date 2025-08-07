const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Warehouse extends Model {
    static associate(models) {
      // define associations here
      Warehouse.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      Warehouse.hasMany(models.Inventory, {
        foreignKey: 'warehouse_id',
        as: 'inventories'
      });
      
      // Association for purchase orders
      Warehouse.hasMany(models.PurchaseOrder, {
        foreignKey: 'warehouse_id',
        as: 'purchase_orders'
      });
      
      // Association for sales orders
      Warehouse.hasMany(models.SalesOrder, {
        foreignKey: 'warehouse_id',
        as: 'sales_orders'
      });
    }
  }
  
  Warehouse.init({
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    address_line1: {
      type: DataTypes.STRING
    },
    address_line2: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    postal_code: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    contact_name: {
      type: DataTypes.STRING
    },
    contact_email: {
      type: DataTypes.STRING
    },
    contact_phone: {
      type: DataTypes.STRING
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    location: {
      type: DataTypes.JSONB
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
    modelName: 'Warehouse',
    tableName: 'warehouses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['code', 'tenant_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_default']
      }
    ]
  });
  
  return Warehouse;
};