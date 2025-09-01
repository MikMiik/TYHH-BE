"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {}
  }
  Document.init(
    {
      name: { type: DataTypes.STRING(191), allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: false },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.STRING(50), allowNull: true },
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
      modelName: "Document",
      tableName: "documents",
      timestamps: true,
      paranoid: true,
    }
  );
  return Document;
};
