"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Like.init(
    {
      userId: DataTypes.INTEGER,

      likableId: DataTypes.INTEGER,

      likableType: DataTypes.STRING(255),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "likes",
      timestamps: true,
    }
  );

  return Like;
};
