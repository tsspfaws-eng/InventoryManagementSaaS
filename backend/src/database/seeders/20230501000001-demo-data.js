'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create demo tenant
    const tenantId = uuidv4();
    await queryInterface.bulkInsert('tenants', [{
      id: tenantId,
      name: 'Demo Company',
      company_name: 'Demo Company Inc.',
      email: 'admin@democompany.com',
      subscription_plan: 'professional',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      is_active: true,
      settings: JSON.stringify({
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'America/New_York'
      }),
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      tenant_id: tenantId,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@democompany.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      last_login_at: new Date(),
      preferences: JSON.stringify({
        theme: 'light',
        language: 'en',
        notifications: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create warehouse
    const warehouseId = uuidv4();
    await queryInterface.bulkInsert('warehouses', [{
      id: warehouseId,
      tenant_id: tenantId,
      name: 'Main Warehouse',
      code: 'WH001',
      description: 'Primary warehouse location',
      address_line1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
      contact_name: 'Warehouse Manager',
      contact_email: 'warehouse@democompany.com',
      contact_phone: '(555) 123-4567',
      is_active: true,
      is_default: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create products
    const products = [
      {
        id: uuidv4(),
        tenant_id: tenantId,
        sku: 'PROD001',
        name: 'Office Chair',
        description: 'Ergonomic office chair with adjustable height',
        category: 'Furniture',
        unit_of_measure: 'each',
        barcode: '1234567890123',
        brand: 'OfficePro',
        model_number: 'OP-CH100',
        manufacturer: 'Office Furniture Inc.',
        weight: 15.5,
        dimensions: JSON.stringify({ length: 24, width: 24, height: 36, unit: 'in' }),
        cost_price: 75.00,
        selling_price: 149.99,
        tax_rate: 8.25,
        min_stock_level: 5,
        max_stock_level: 50,
        reorder_point: 10,
        lead_time_days: 7,
        is_active: true,
        is_perishable: false,
        is_serialized: false,
        is_lot_tracked: false,
        images: JSON.stringify([{ url: 'https://example.com/images/chair.jpg', alt: 'Office Chair' }]),
        attributes: JSON.stringify({
          color: 'Black',
          material: 'Mesh',
          adjustable: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        tenant_id: tenantId,
        sku: 'PROD002',
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        category: 'Lighting',
        unit_of_measure: 'each',
        barcode: '2345678901234',
        brand: 'LightMax',
        model_number: 'LM-DL200',
        manufacturer: 'Lighting Solutions LLC',
        weight: 2.3,
        dimensions: JSON.stringify({ length: 6, width: 6, height: 18, unit: 'in' }),
        cost_price: 22.50,
        selling_price: 39.99,
        tax_rate: 8.25,
        min_stock_level: 10,
        max_stock_level: 100,
        reorder_point: 20,
        lead_time_days: 5,
        is_active: true,
        is_perishable: false,
        is_serialized: false,
        is_lot_tracked: false,
        images: JSON.stringify([{ url: 'https://example.com/images/lamp.jpg', alt: 'Desk Lamp' }]),
        attributes: JSON.stringify({
          color: 'Silver',
          wattage: '5W',
          dimmable: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        tenant_id: tenantId,
        sku: 'PROD003',
        name: 'Notebook',
        description: 'Premium hardcover notebook, 100 pages',
        category: 'Office Supplies',
        unit_of_measure: 'each',
        barcode: '3456789012345',
        brand: 'NotePro',
        model_number: 'NP-100',
        manufacturer: 'Paper Products Inc.',
        weight: 0.5,
        dimensions: JSON.stringify({ length: 8.5, width: 11, height: 0.5, unit: 'in' }),
        cost_price: 4.25,
        selling_price: 12.99,
        tax_rate: 8.25,
        min_stock_level: 20,
        max_stock_level: 200,
        reorder_point: 40,
        lead_time_days: 3,
        is_active: true,
        is_perishable: false,
        is_serialized: false,
        is_lot_tracked: true,
        images: JSON.stringify([{ url: 'https://example.com/images/notebook.jpg', alt: 'Notebook' }]),
        attributes: JSON.stringify({
          color: 'Blue',
          paper_type: 'Ruled',
          cover: 'Hardcover'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('products', products);

    // Create inventory records
    const inventories = products.map(product => ({
      id: uuidv4(),
      tenant_id: tenantId,
      product_id: product.id,
      warehouse_id: warehouseId,
      quantity_on_hand: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
      quantity_reserved: 0,
      bin_location: `AISLE-${Math.floor(Math.random() * 10) + 1}-SHELF-${Math.floor(Math.random() * 5) + 1}`,
      last_counted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('inventories', inventories);

    // Create a sample purchase order
    const purchaseOrderId = uuidv4();
    await queryInterface.bulkInsert('purchase_orders', [{
      id: purchaseOrderId,
      tenant_id: tenantId,
      order_number: 'PO2305010001',
      supplier_name: 'Office Supply Co.',
      supplier_email: 'orders@officesupply.com',
      supplier_phone: '(555) 987-6543',
      warehouse_id: warehouseId,
      status: 'confirmed',
      order_date: new Date(),
      expected_delivery_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      subtotal: 500.00,
      tax_total: 41.25,
      shipping_cost: 25.00,
      total: 566.25,
      currency: 'USD',
      payment_terms: 'Net 30',
      payment_status: 'unpaid',
      payment_due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      shipping_address_line1: '123 Main Street',
      shipping_city: 'New York',
      shipping_state: 'NY',
      shipping_postal_code: '10001',
      shipping_country: 'USA',
      notes: 'Please deliver during business hours (9 AM - 5 PM)',
      created_by: adminId,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create purchase order items
    const purchaseOrderItems = products.map(product => ({
      id: uuidv4(),
      purchase_order_id: purchaseOrderId,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: Math.floor(Math.random() * 10) + 5, // Random quantity between 5-15
      quantity_received: 0,
      unit_of_measure: product.unit_of_measure,
      unit_price: product.cost_price,
      tax_rate: product.tax_rate,
      discount_rate: 0,
      subtotal: (Math.floor(Math.random() * 10) + 5) * product.cost_price,
      tax_amount: (Math.floor(Math.random() * 10) + 5) * product.cost_price * (product.tax_rate / 100),
      discount_amount: 0,
      total: (Math.floor(Math.random() * 10) + 5) * product.cost_price * (1 + product.tax_rate / 100),
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('purchase_order_items', purchaseOrderItems);

    // Create a sample sales order
    const salesOrderId = uuidv4();
    await queryInterface.bulkInsert('sales_orders', [{
      id: salesOrderId,
      tenant_id: tenantId,
      order_number: 'SO2305010001',
      customer_name: 'Acme Corporation',
      customer_email: 'purchasing@acme.com',
      customer_phone: '(555) 123-4567',
      warehouse_id: warehouseId,
      status: 'confirmed',
      order_date: new Date(),
      expected_ship_date: new Date(new Date().setDate(new Date().getDate() + 3)),
      subtotal: 350.00,
      tax_total: 28.88,
      shipping_cost: 15.00,
      total: 393.88,
      currency: 'USD',
      payment_terms: 'Net 15',
      payment_status: 'unpaid',
      payment_due_date: new Date(new Date().setDate(new Date().getDate() + 15)),
      shipping_address_line1: '456 Corporate Drive',
      shipping_city: 'Los Angeles',
      shipping_state: 'CA',
      shipping_postal_code: '90001',
      shipping_country: 'USA',
      shipping_method: 'Ground',
      notes: 'Please include invoice with shipment',
      created_by: adminId,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create sales order items
    const salesOrderItems = products.map(product => ({
      id: uuidv4(),
      sales_order_id: salesOrderId,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: Math.floor(Math.random() * 5) + 1, // Random quantity between 1-5
      quantity_fulfilled: 0,
      unit_of_measure: product.unit_of_measure,
      unit_price: product.selling_price,
      tax_rate: product.tax_rate,
      discount_rate: 0,
      subtotal: (Math.floor(Math.random() * 5) + 1) * product.selling_price,
      tax_amount: (Math.floor(Math.random() * 5) + 1) * product.selling_price * (product.tax_rate / 100),
      discount_amount: 0,
      total: (Math.floor(Math.random() * 5) + 1) * product.selling_price * (1 + product.tax_rate / 100),
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('sales_order_items', salesOrderItems);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded data in reverse order
    await queryInterface.bulkDelete('sales_order_items', null, {});
    await queryInterface.bulkDelete('sales_orders', null, {});
    await queryInterface.bulkDelete('purchase_order_items', null, {});
    await queryInterface.bulkDelete('purchase_orders', null, {});
    await queryInterface.bulkDelete('inventories', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('warehouses', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('tenants', null, {});
  }
};