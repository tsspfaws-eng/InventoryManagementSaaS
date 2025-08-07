const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Tenant extends Model {
    static associate(models) {
      // define associations here
      Tenant.hasMany(models.User, {
        foreignKey: 'tenant_id',
        as: 'users'
      });
      
      Tenant.hasMany(models.Product, {
        foreignKey: 'tenant_id',
        as: 'products'
      });
      
      Tenant.hasMany(models.Warehouse, {
        foreignKey: 'tenant_id',
        as: 'warehouses'
      });
    }
    
    // Instance method to check if subscription is active
    isSubscriptionActive() {
      if (this.subscription_status === 'active') {
        return true;
      }
      
      if (this.subscription_status === 'trial') {
        const trialEndsAt = new Date(this.trial_ends_at);
        return trialEndsAt > new Date();
      }
      
      return false;
    }
  }
  
  Tenant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    address_street: DataTypes.STRING,
    address_city: DataTypes.STRING,
    address_state: DataTypes.STRING,
    address_country: DataTypes.STRING,
    address_zip_code: DataTypes.STRING,
    subscription_plan: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
      defaultValue: 'free'
    },
    subscription_status: {
      type: DataTypes.ENUM('active', 'trial', 'expired', 'cancelled'),
      defaultValue: 'trial'
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    billing_payment_method: DataTypes.STRING,
    billing_card_last4: DataTypes.STRING,
    billing_expiry_date: DataTypes.STRING,
    settings_theme: {
      type: DataTypes.STRING,
      defaultValue: 'light'
    },
    settings_timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    settings_date_format: {
      type: DataTypes.STRING,
      defaultValue: 'MM/DD/YYYY'
    },
    settings_currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    settings_language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_users: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    max_products: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    max_warehouses: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    feature_flags: {
      type: DataTypes.JSONB,
      defaultValue: {
        multiWarehouse: false,
        barcodeScanning: false,
        advancedReporting: false,
        apiAccess: false,
        bulkOperations: false
      }
    }
  }, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    timestamps: true,
    underscored: true
  });
  
  return Tenant;
};