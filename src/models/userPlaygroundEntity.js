"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPlaygroundEntity extends Model {
    static associate(models) {
      // A user playground entity belongs to a user
      UserPlaygroundEntity.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // A user playground entity belongs to an entity
      UserPlaygroundEntity.belongsTo(models.Entity, {
        foreignKey: "entityId",
        as: "entity",
      });
    }
  }

  UserPlaygroundEntity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discoveredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserPlaygroundEntity",
      tableName: "user_playground_entities",
      timestamps: true,
    }
  );

  return UserPlaygroundEntity;
};

