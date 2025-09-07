"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {}
  }
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      livestreamId: { type: DataTypes.INTEGER, allowNull: true },
      vip: { type: DataTypes.BOOLEAN, defaultValue: false },
      title: { type: DataTypes.STRING(255), allowNull: true },
      thumbnail: { type: DataTypes.STRING(255), allowNull: true },
      url: { type: DataTypes.STRING(255), allowNull: true },
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
