"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class School extends Model {
    static associate(models) {}
  }
  School.init(
    {
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      cityId: { type: DataTypes.INTEGER, allowNull: true },
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
      modelName: "School",
      tableName: "schools",
      timestamps: true,
      paranoid: true,
    }
  );
  return School;
};
