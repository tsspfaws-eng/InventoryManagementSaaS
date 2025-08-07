const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SalesOrder extends Model {
    static associate(models) {
      // define associations here
      SalesOrder.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      SalesOrder.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      SalesOrder.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      SalesOrder.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
      
      SalesOrder.hasMany(models.SalesOrderItem, {
        foreignKey: 'sales_order_id',
        as: 'items'
      });
    }
    
    // Instance method to calculate totals
    calculateTotals() {
      if (!this.items || this.items.length === 0) return;
      
      let subtotal = 0;
      let tax_total = 0;
      let discount_total = 0;
      
      this.items.forEach(item => {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemDiscount = itemSubtotal * (item.discount_rate / 100);
        const itemTax = (itemSubtotal - itemDiscount) * (item.tax_rate / 100);
        
        subtotal += itemSubtotal;
        discount_total += itemDiscount;
        tax_total += itemTax;
      });
      
      this.subtotal = subtotal;
      this.discount_total = discount_total;
      this.tax_total = tax_total;
      this.shipping_cost = this.shipping_cost || 0;
      this.total = subtotal - discount_total + tax_total + this.shipping_cost;
      
      return this;
    }
    
    // Instance method to update status based on fulfilled quantities
    async updateStatus() {
      if (!this.items || this.items.length === 0) return this;
      
      let totalItems = 0;
      let totalFulfilled = 0;
      
      this.items.forEach(item => {
        totalItems += item.quantity;
        totalFulfilled += item.quantity_fulfilled || 0;
      });
      
      if (totalFulfilled === 0) {
        this.status = 'pending';
      } else if (totalFulfilled < totalItems) {
        this.status = 'partially_fulfilled';
      } else {
        this.status = 'fulfilled';
      }
      
      await this.save();
      return this;
    }
    
    // Instance method to reserve inventory for this order
    async reserveInventory(transaction = null) {
      if (!this.items || this.items.length === 0) return this;
      
      for (const item of this.items) {
        if (!item.product_id) continue;
        
        // Find inventory for this product in the specified warehouse
        const inventory = await sequelize.models.Inventory.findOne({
          where: {
            tenant_id: this.tenant_id,
            product_id: item.product_id,
            warehouse_id: this.warehouse_id
          }
        });
        
        if (!inventory) continue;
        
        // Calculate quantity to reserve (remaining quantity not yet fulfilled)
        const quantityToReserve = item.quantity - (item.quantity_fulfilled || 0);
        
        if (quantityToReserve <= 0) continue;
        
        // Reserve the inventory
        await inventory.reserveInventory(
          quantityToReserve,
          'sales_order',
          this.id,
          transaction
        );
      }
      
      return this;
    }
    
    // Instance method to release reserved inventory for this order
    async releaseInventory(transaction = null) {
      if (!this.items || this.items.length === 0) return this;
      
      for (const item of this.items) {
        if (!item.product_id) continue;
        
        // Find inventory for this product in the specified warehouse
        const inventory = await sequelize.models.Inventory.findOne({
          where: {
            tenant_id: this.tenant_id,
            product_id: item.product_id,
            warehouse_id: this.warehouse_id
          }
        });
        
        if (!inventory) continue;
        
        // Calculate quantity to release (remaining quantity not yet fulfilled)
        const quantityToRelease = item.quantity - (item.quantity_fulfilled || 0);
        
        if (quantityToRelease <= 0) continue;
        
        // Release the inventory
        await inventory.releaseInventory(
          quantityToRelease,
          'sales_order',
          this.id,
          transaction
        );
      }
      
      return this;
    }
    
    // Static method to generate order number
    static async generateOrderNumber(tenantId) {
      const prefix = 'SO';
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      
      // Find the latest order number for this tenant with the same prefix and year-month
      const latestOrder = await this.findOne({
        where: {
          tenant_id: tenantId,
          order_number: {
            [sequelize.Op.like]: `${prefix}${year}${month}%`
          }
        },
        order: [['order_number', 'DESC']]
      });
      
      let nextNumber = 1;
      
      if (latestOrder) {
        // Extract the numeric part and increment
        const lastNumber = parseInt(latestOrder.order_number.substr(6), 10);
        nextNumber = lastNumber + 1;
      }
      
      // Format with leading zeros (4 digits)
      return `${prefix}${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    }
  }
  
  SalesOrder.init({
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
    order_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customer_email: {
      type: DataTypes.STRING
    },
    customer_phone: {
      type: DataTypes.STRING
    },
    customer_reference: {
      type: DataTypes.STRING
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'pending',
        'confirmed',
        'processing',
        'partially_fulfilled',
        'fulfilled',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
        'closed'
      ),
      defaultValue: 'draft'
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expected_ship_date: {
      type: DataTypes.DATE
    },
    ship_date: {
      type: DataTypes.DATE
    },
    delivery_date: {
      type: DataTypes.DATE
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discount_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    payment_terms: {
      type: DataTypes.STRING
    },
    payment_status: {
      type: DataTypes.ENUM(
        'unpaid',
        'partially_paid',
        'paid',
        'overdue'
      ),
      defaultValue: 'unpaid'
    },
    payment_due_date: {
      type: DataTypes.DATE
    },
    shipping_address_line1: {
      type: DataTypes.STRING
    },
    shipping_address_line2: {
      type: DataTypes.STRING
    },
    shipping_city: {
      type: DataTypes.STRING
    },
    shipping_state: {
      type: DataTypes.STRING
    },
    shipping_postal_code: {
      type: DataTypes.STRING
    },
    shipping_country: {
      type: DataTypes.STRING
    },
    billing_address_line1: {
      type: DataTypes.STRING
    },
    billing_address_line2: {
      type: DataTypes.STRING
    },
    billing_city: {
      type: DataTypes.STRING
    },
    billing_state: {
      type: DataTypes.STRING
    },
    billing_postal_code: {
      type: DataTypes.STRING
    },
    billing_country: {
      type: DataTypes.STRING
    },
    shipping_method: {
      type: DataTypes.STRING
    },
    tracking_number: {
      type: DataTypes.STRING
    },
    carrier: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    internal_notes: {
      type: DataTypes.TEXT
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    source: {
      type: DataTypes.STRING
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'SalesOrder',
    tableName: 'sales_orders',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'order_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['order_date']
      },
      {
        fields: ['customer_name']
      },
      {
        fields: ['payment_status']
      }
    ],
    hooks: {
      beforeCreate: async (salesOrder) => {
        if (!salesOrder.order_number) {
          salesOrder.order_number = await SalesOrder.generateOrderNumber(salesOrder.tenant_id);
        }
      }
    }
  });
  
  return SalesOrder;
};

// Define SalesOrderItem model
module.exports.SalesOrderItem = (sequelize) => {
  class SalesOrderItem extends Model {
    static associate(models) {
      // define associations here
      SalesOrderItem.belongsTo(models.SalesOrder, {
        foreignKey: 'sales_order_id',
        as: 'sales_order'
      });
      
      SalesOrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  
  SalesOrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sales_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sales_orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_sku: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    quantity_fulfilled: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    unit_of_measure: {
      type: DataTypes.STRING,
      defaultValue: 'each'
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    discount_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'SalesOrderItem',
    tableName: 'sales_order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['sales_order_id']
      },
      {
        fields: ['product_id']
      }
    ],
    hooks: {
      beforeCreate: (item) => {
        // Calculate item totals
        item.subtotal = item.quantity * item.unit_price;
        item.discount_amount = item.subtotal * (item.discount_rate / 100);
        item.tax_amount = (item.subtotal - item.discount_amount) * (item.tax_rate / 100);
        item.total = item.subtotal - item.discount_amount + item.tax_amount;
      },
      beforeUpdate: (item) => {
        // Recalculate if relevant fields changed
        if (item.changed('quantity') || item.changed('unit_price') || 
            item.changed('tax_rate') || item.changed('discount_rate')) {
          item.subtotal = item.quantity * item.unit_price;
          item.discount_amount = item.subtotal * (item.discount_rate / 100);
          item.tax_amount = (item.subtotal - item.discount_amount) * (item.tax_rate / 100);
          item.total = item.subtotal - item.discount_amount + item.tax_amount;
        }
      },
      afterCreate: async (item) => {
        // Update sales order totals
        const salesOrder = await sequelize.models.SalesOrder.findByPk(item.sales_order_id, {
          include: [{ model: sequelize.models.SalesOrderItem, as: 'items' }]
        });
        
        if (salesOrder) {
          await salesOrder.calculateTotals().save();
        }
      },
      afterUpdate: async (item) => {
        // Update sales order totals and status
        const salesOrder = await sequelize.models.SalesOrder.findByPk(item.sales_order_id, {
          include: [{ model: sequelize.models.SalesOrderItem, as: 'items' }]
        });
        
        if (salesOrder) {
          await salesOrder.calculateTotals().save();
          await salesOrder.updateStatus();
        }
      }
    }
  });
  
  return SalesOrderItem;
};