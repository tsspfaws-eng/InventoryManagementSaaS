'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create tenants table
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      subscription_plan: {
        type: Sequelize.STRING,
        defaultValue: 'free'
      },
      subscription_start_date: {
        type: Sequelize.DATE
      },
      subscription_end_date: {
        type: Sequelize.DATE
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'user'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login_at: {
        type: Sequelize.DATE
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + email in users table
    await queryInterface.addIndex('users', ['tenant_id', 'email'], {
      unique: true,
      name: 'users_tenant_id_email_unique'
    });

    // Create warehouses table
    await queryInterface.createTable('warehouses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      address_line1: {
        type: Sequelize.STRING
      },
      address_line2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      postal_code: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      contact_name: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + code in warehouses table
    await queryInterface.addIndex('warehouses', ['tenant_id', 'code'], {
      unique: true,
      name: 'warehouses_tenant_id_code_unique'
    });

    // Create products table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      category: {
        type: Sequelize.STRING
      },
      unit_of_measure: {
        type: Sequelize.STRING,
        defaultValue: 'each'
      },
      barcode: {
        type: Sequelize.STRING
      },
      brand: {
        type: Sequelize.STRING
      },
      model_number: {
        type: Sequelize.STRING
      },
      manufacturer: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2)
      },
      dimensions: {
        type: Sequelize.JSONB
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      selling_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      min_stock_level: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      max_stock_level: {
        type: Sequelize.INTEGER
      },
      reorder_point: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lead_time_days: {
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_perishable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_serialized: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_lot_tracked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      images: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      attributes: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + sku in products table
    await queryInterface.addIndex('products', ['tenant_id', 'sku'], {
      unique: true,
      name: 'products_tenant_id_sku_unique'
    });

    // Create inventory table
    await queryInterface.createTable('inventories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity_on_hand: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      quantity_reserved: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      bin_location: {
        type: Sequelize.STRING
      },
      lot_number: {
        type: Sequelize.STRING
      },
      expiry_date: {
        type: Sequelize.DATE
      },
      serial_numbers: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      last_counted_at: {
        type: Sequelize.DATE
      },
      last_received_at: {
        type: Sequelize.DATE
      },
      last_issued_at: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + product_id + warehouse_id in inventory table
    await queryInterface.addIndex('inventories', ['tenant_id', 'product_id', 'warehouse_id'], {
      unique: true,
      name: 'inventories_tenant_product_warehouse_unique'
    });

    // Create inventory_transactions table
    await queryInterface.createTable('inventory_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inventory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'inventories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transaction_type: {
        type: Sequelize.ENUM(
          'receive',
          'issue',
          'transfer_in',
          'transfer_out',
          'adjustment',
          'count',
          'reserve',
          'release',
          'return',
          'scrap',
          'production'
        ),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity_before: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING
      },
      reference_id: {
        type: Sequelize.UUID
      },
      lot_number: {
        type: Sequelize.STRING
      },
      expiry_date: {
        type: Sequelize.DATE
      },
      serial_numbers: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      unit_cost: {
        type: Sequelize.DECIMAL(10, 2)
      },
      total_cost: {
        type: Sequelize.DECIMAL(10, 2)
      },
      reason: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create purchase_orders table
    await queryInterface.createTable('purchase_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_id: {
        type: Sequelize.UUID
      },
      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_email: {
        type: Sequelize.STRING
      },
      supplier_phone: {
        type: Sequelize.STRING
      },
      supplier_reference: {
        type: Sequelize.STRING
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM(
          'draft',
          'pending',
          'sent',
          'confirmed',
          'partially_received',
          'received',
          'cancelled',
          'closed'
        ),
        defaultValue: 'draft'
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expected_delivery_date: {
        type: Sequelize.DATE
      },
      delivery_date: {
        type: Sequelize.DATE
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      tax_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      discount_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD'
      },
      payment_terms: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.ENUM(
          'unpaid',
          'partially_paid',
          'paid',
          'overdue'
        ),
        defaultValue: 'unpaid'
      },
      payment_due_date: {
        type: Sequelize.DATE
      },
      shipping_address_line1: {
        type: Sequelize.STRING
      },
      shipping_address_line2: {
        type: Sequelize.STRING
      },
      shipping_city: {
        type: Sequelize.STRING
      },
      shipping_state: {
        type: Sequelize.STRING
      },
      shipping_postal_code: {
        type: Sequelize.STRING
      },
      shipping_country: {
        type: Sequelize.STRING
      },
      billing_address_line1: {
        type: Sequelize.STRING
      },
      billing_address_line2: {
        type: Sequelize.STRING
      },
      billing_city: {
        type: Sequelize.STRING
      },
      billing_state: {
        type: Sequelize.STRING
      },
      billing_postal_code: {
        type: Sequelize.STRING
      },
      billing_country: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      internal_notes: {
        type: Sequelize.TEXT
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + order_number in purchase_orders table
    await queryInterface.addIndex('purchase_orders', ['tenant_id', 'order_number'], {
      unique: true,
      name: 'purchase_orders_tenant_id_order_number_unique'
    });

    // Create purchase_order_items table
    await queryInterface.createTable('purchase_order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      purchase_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_sku: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      quantity_received: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      unit_of_measure: {
        type: Sequelize.STRING,
        defaultValue: 'each'
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      discount_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create sales_orders table
    await queryInterface.createTable('sales_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.UUID
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customer_email: {
        type: Sequelize.STRING
      },
      customer_phone: {
        type: Sequelize.STRING
      },
      customer_reference: {
        type: Sequelize.STRING
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expected_ship_date: {
        type: Sequelize.DATE
      },
      ship_date: {
        type: Sequelize.DATE
      },
      delivery_date: {
        type: Sequelize.DATE
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      tax_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      discount_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD'
      },
      payment_terms: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.ENUM(
          'unpaid',
          'partially_paid',
          'paid',
          'overdue'
        ),
        defaultValue: 'unpaid'
      },
      payment_due_date: {
        type: Sequelize.DATE
      },
      shipping_address_line1: {
        type: Sequelize.STRING
      },
      shipping_address_line2: {
        type: Sequelize.STRING
      },
      shipping_city: {
        type: Sequelize.STRING
      },
      shipping_state: {
        type: Sequelize.STRING
      },
      shipping_postal_code: {
        type: Sequelize.STRING
      },
      shipping_country: {
        type: Sequelize.STRING
      },
      billing_address_line1: {
        type: Sequelize.STRING
      },
      billing_address_line2: {
        type: Sequelize.STRING
      },
      billing_city: {
        type: Sequelize.STRING
      },
      billing_state: {
        type: Sequelize.STRING
      },
      billing_postal_code: {
        type: Sequelize.STRING
      },
      billing_country: {
        type: Sequelize.STRING
      },
      shipping_method: {
        type: Sequelize.STRING
      },
      tracking_number: {
        type: Sequelize.STRING
      },
      carrier: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      internal_notes: {
        type: Sequelize.TEXT
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      source: {
        type: Sequelize.STRING
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create unique index for tenant_id + order_number in sales_orders table
    await queryInterface.addIndex('sales_orders', ['tenant_id', 'order_number'], {
      unique: true,
      name: 'sales_orders_tenant_id_order_number_unique'
    });

    // Create sales_order_items table
    await queryInterface.createTable('sales_order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sales_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sales_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_sku: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      quantity_fulfilled: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      unit_of_measure: {
        type: Sequelize.STRING,
        defaultValue: 'each'
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      discount_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('sales_order_items');
    await queryInterface.dropTable('sales_orders');
    await queryInterface.dropTable('purchase_order_items');
    await queryInterface.dropTable('purchase_orders');
    await queryInterface.dropTable('inventory_transactions');
    await queryInterface.dropTable('inventories');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('warehouses');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('tenants');
  }
};