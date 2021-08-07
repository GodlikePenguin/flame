const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'bookmarks' // Default value for database migration only
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'categories'
});

module.exports = Category;