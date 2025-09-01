"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {}
  }
  City.init(
    {
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "City",
      tableName: "cities",
      timestamps: true,
      paranoid: true,
    }
  );
  return City;
};
