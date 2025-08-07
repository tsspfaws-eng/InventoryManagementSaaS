const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define associations here
      User.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
    }
    
    // Instance method to check if password matches
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
    
    // Instance method to generate JWT token
    generateToken() {
      const token = jwt.sign(
        { 
          id: this.id,
          email: this.email,
          tenant_id: this.tenant_id,
          role: this.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      return token;
    }
    
    // Class method to find user by credentials
    static async findByCredentials(email, password, tenantId) {
      const user = await User.findOne({ 
        where: { 
          email,
          tenant_id: tenantId,
          is_active: true
        } 
      });
      
      if (!user) {
        throw new Error('Invalid login credentials');
      }
      
      const isMatch = await user.checkPassword(password);
      
      if (!isMatch) {
        throw new Error('Invalid login credentials');
      }
      
      return user;
    }
  }
  
  User.init({
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
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'staff', 'readonly'),
      defaultValue: 'staff'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    phone: DataTypes.STRING,
    avatar: DataTypes.STRING,
    department: DataTypes.STRING,
    last_login: DataTypes.DATE,
    password_reset_token: DataTypes.STRING,
    password_reset_expires: DataTypes.DATE,
    preferences_theme: {
      type: DataTypes.ENUM('light', 'dark', 'system'),
      defaultValue: 'system'
    },
    preferences_notifications_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    preferences_notifications_in_app: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email', 'tenant_id']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  
  return User;
};