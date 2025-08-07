const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Inventory extends Model {
    static associate(models) {
      // define associations here
      Inventory.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      Inventory.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      
      Inventory.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      Inventory.hasMany(models.InventoryTransaction, {
        foreignKey: 'inventory_id',
        as: 'transactions'
      });
    }
    
    // Instance method to check if inventory is low
    isLowStock() {
      if (!this.product) return false;
      return this.quantity_on_hand <= this.product.reorder_point;
    }
    
    // Instance method to get available quantity
    getAvailableQuantity() {
      return this.quantity_on_hand - this.quantity_reserved;
    }
    
    // Instance method to reserve inventory
    async reserveInventory(quantity, referenceType, referenceId, transaction = null) {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      
      if (this.getAvailableQuantity() < quantity) {
        throw new Error('Not enough available inventory to reserve');
      }
      
      this.quantity_reserved += quantity;
      await this.save({ transaction });
      
      // Create inventory transaction record
      await sequelize.models.InventoryTransaction.create({
        tenant_id: this.tenant_id,
        inventory_id: this.id,
        product_id: this.product_id,
        warehouse_id: this.warehouse_id,
        transaction_type: 'reserve',
        quantity: quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        notes: `Reserved ${quantity} units for ${referenceType} #${referenceId}`
      }, { transaction });
      
      return true;
    }
    
    // Instance method to release reserved inventory
    async releaseInventory(quantity, referenceType, referenceId, transaction = null) {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      
      if (this.quantity_reserved < quantity) {
        throw new Error('Cannot release more than reserved quantity');
      }
      
      this.quantity_reserved -= quantity;
      await this.save({ transaction });
      
      // Create inventory transaction record
      await sequelize.models.InventoryTransaction.create({
        tenant_id: this.tenant_id,
        inventory_id: this.id,
        product_id: this.product_id,
        warehouse_id: this.warehouse_id,
        transaction_type: 'release',
        quantity: quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        notes: `Released ${quantity} units from ${referenceType} #${referenceId}`
      }, { transaction });
      
      return true;
    }
    
    // Instance method to adjust inventory
    async adjustInventory(quantity, reason, notes, userId, transaction = null) {
      const oldQuantity = this.quantity_on_hand;
      this.quantity_on_hand = quantity;
      await this.save({ transaction });
      
      // Create inventory transaction record
      await sequelize.models.InventoryTransaction.create({
        tenant_id: this.tenant_id,
        inventory_id: this.id,
        product_id: this.product_id,
        warehouse_id: this.warehouse_id,
        transaction_type: 'adjustment',
        quantity: quantity - oldQuantity,
        reference_type: 'adjustment',
        reference_id: null,
        reason: reason,
        notes: notes,
        created_by: userId
      }, { transaction });
      
      return true;
    }
  }
  
  Inventory.init({
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
    quantity_on_hand: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    quantity_reserved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    quantity_available: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.quantity_on_hand - this.quantity_reserved;
      }
    },
    bin_location: {
      type: DataTypes.STRING
    },
    aisle: {
      type: DataTypes.STRING
    },
    rack: {
      type: DataTypes.STRING
    },
    shelf: {
      type: DataTypes.STRING
    },
    lot_number: {
      type: DataTypes.STRING
    },
    expiry_date: {
      type: DataTypes.DATE
    },
    serial_numbers: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    last_counted_date: {
      type: DataTypes.DATE
    },
    last_received_date: {
      type: DataTypes.DATE
    },
    last_sold_date: {
      type: DataTypes.DATE
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
    modelName: 'Inventory',
    tableName: 'inventories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'warehouse_id', 'lot_number']
      },
      {
        fields: ['tenant_id']
      },
      {
        fields: ['quantity_on_hand']
      }
    ]
  });
  
  return Inventory;
};