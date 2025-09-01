"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  RefreshToken.init(
    {
      userId: DataTypes.INTEGER,

      token: DataTypes.STRING,

      expiredAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "RefreshToken",
      tableName: "refresh-tokens",
      timestamps: true,
    }
  );
  return RefreshToken;
};
