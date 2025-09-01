"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Slidenote extends Model {
    static associate(models) {}
  }
  Slidenote.init(
    {
      name: { type: DataTypes.STRING(191), allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: false },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
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
      modelName: "Slidenote",
      tableName: "slidenotes",
      timestamps: true,
      paranoid: true,
    }
  );
  return Slidenote;
};
