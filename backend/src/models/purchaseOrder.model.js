const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PurchaseOrder extends Model {
    static associate(models) {
      // define associations here
      PurchaseOrder.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      
      PurchaseOrder.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      PurchaseOrder.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      PurchaseOrder.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
      
      PurchaseOrder.hasMany(models.PurchaseOrderItem, {
        foreignKey: 'purchase_order_id',
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
        const itemSubtotal = item.quantity * item.unit_cost;
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
    
    // Instance method to update status based on received quantities
    async updateStatus() {
      if (!this.items || this.items.length === 0) return this;
      
      let totalItems = 0;
      let totalReceived = 0;
      
      this.items.forEach(item => {
        totalItems += item.quantity;
        totalReceived += item.quantity_received || 0;
      });
      
      if (totalReceived === 0) {
        this.status = 'pending';
      } else if (totalReceived < totalItems) {
        this.status = 'partially_received';
      } else {
        this.status = 'received';
      }
      
      await this.save();
      return this;
    }
    
    // Static method to generate order number
    static async generateOrderNumber(tenantId) {
      const prefix = 'PO';
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
  
  PurchaseOrder.init({
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
    supplier_id: {
      type: DataTypes.UUID
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    supplier_email: {
      type: DataTypes.STRING
    },
    supplier_phone: {
      type: DataTypes.STRING
    },
    supplier_reference: {
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
        'partially_received',
        'received',
        'cancelled',
        'closed'
      ),
      defaultValue: 'draft'
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expected_delivery_date: {
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
    modelName: 'PurchaseOrder',
    tableName: 'purchase_orders',
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
        fields: ['supplier_name']
      },
      {
        fields: ['payment_status']
      }
    ],
    hooks: {
      beforeCreate: async (purchaseOrder) => {
        if (!purchaseOrder.order_number) {
          purchaseOrder.order_number = await PurchaseOrder.generateOrderNumber(purchaseOrder.tenant_id);
        }
      }
    }
  });
  
  return PurchaseOrder;
};

// Define PurchaseOrderItem model
module.exports.PurchaseOrderItem = (sequelize) => {
  class PurchaseOrderItem extends Model {
    static associate(models) {
      // define associations here
      PurchaseOrderItem.belongsTo(models.PurchaseOrder, {
        foreignKey: 'purchase_order_id',
        as: 'purchase_order'
      });
      
      PurchaseOrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  
  PurchaseOrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    purchase_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'purchase_orders',
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
    quantity_received: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    unit_of_measure: {
      type: DataTypes.STRING,
      defaultValue: 'each'
    },
    unit_cost: {
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
    modelName: 'PurchaseOrderItem',
    tableName: 'purchase_order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['purchase_order_id']
      },
      {
        fields: ['product_id']
      }
    ],
    hooks: {
      beforeCreate: (item) => {
        // Calculate item totals
        item.subtotal = item.quantity * item.unit_cost;
        item.discount_amount = item.subtotal * (item.discount_rate / 100);
        item.tax_amount = (item.subtotal - item.discount_amount) * (item.tax_rate / 100);
        item.total = item.subtotal - item.discount_amount + item.tax_amount;
      },
      beforeUpdate: (item) => {
        // Recalculate if relevant fields changed
        if (item.changed('quantity') || item.changed('unit_cost') || 
            item.changed('tax_rate') || item.changed('discount_rate')) {
          item.subtotal = item.quantity * item.unit_cost;
          item.discount_amount = item.subtotal * (item.discount_rate / 100);
          item.tax_amount = (item.subtotal - item.discount_amount) * (item.tax_rate / 100);
          item.total = item.subtotal - item.discount_amount + item.tax_amount;
        }
      },
      afterCreate: async (item) => {
        // Update purchase order totals
        const purchaseOrder = await sequelize.models.PurchaseOrder.findByPk(item.purchase_order_id, {
          include: [{ model: sequelize.models.PurchaseOrderItem, as: 'items' }]
        });
        
        if (purchaseOrder) {
          await purchaseOrder.calculateTotals().save();
        }
      },
      afterUpdate: async (item) => {
        // Update purchase order totals and status
        const purchaseOrder = await sequelize.models.PurchaseOrder.findByPk(item.purchase_order_id, {
          include: [{ model: sequelize.models.PurchaseOrderItem, as: 'items' }]
        });
        
        if (purchaseOrder) {
          await purchaseOrder.calculateTotals().save();
          await purchaseOrder.updateStatus();
        }
      }
    }
  });
  
  return PurchaseOrderItem;
};