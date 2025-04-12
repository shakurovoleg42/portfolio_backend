// models/Portfolio.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Portfolio = sequelize.define("Portfolio", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  technologies: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Массив строк
    allowNull: false,
  },
  list: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Массив строк
    allowNull: false,
  },
  linkToOriginal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Portfolio;
