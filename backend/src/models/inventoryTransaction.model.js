const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class InventoryTransaction extends Model {
    static associate(models) {
      // define associations here
      InventoryTransaction.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      InventoryTransaction.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      
      InventoryTransaction.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      InventoryTransaction.belongsTo(models.Inventory, {
        foreignKey: 'inventory_id',
        as: 'inventory'
      });
      
      InventoryTransaction.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  }
  
  InventoryTransaction.init({
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
    inventory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventories',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id'
      }
    },
    transaction_type: {
      type: DataTypes.ENUM(
        'receive', // Receiving inventory from purchase order
        'sale', // Reducing inventory from sales order
        'transfer_in', // Receiving inventory from another warehouse
        'transfer_out', // Sending inventory to another warehouse
        'adjustment', // Manual adjustment
        'return_in', // Customer return
        'return_out', // Return to supplier
        'count', // Inventory count adjustment
        'reserve', // Reserve inventory
        'release', // Release reserved inventory
        'damage', // Damaged inventory
        'expire', // Expired inventory
        'scrap', // Scrapped inventory
        'production_in', // Inventory from production
        'production_out' // Inventory used in production
      ),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity_before: {
      type: DataTypes.DECIMAL(10, 2)
    },
    quantity_after: {
      type: DataTypes.DECIMAL(10, 2)
    },
    reference_type: {
      type: DataTypes.STRING
    },
    reference_id: {
      type: DataTypes.UUID
    },
    lot_number: {
      type: DataTypes.STRING
    },
    expiry_date: {
      type: DataTypes.DATE
    },
    serial_numbers: {
      type: DataTypes.JSONB
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    reason: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'InventoryTransaction',
    tableName: 'inventory_transactions',
    timestamps: true,
    updatedAt: false, // Only need createdAt for transactions
    underscored: true,
    indexes: [
      {
        fields: ['tenant_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['warehouse_id']
      },
      {
        fields: ['inventory_id']
      },
      {
        fields: ['transaction_type']
      },
      {
        fields: ['reference_type', 'reference_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });
  
  return InventoryTransaction;
};