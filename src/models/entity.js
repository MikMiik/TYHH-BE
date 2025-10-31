"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Entity extends Model {
    static associate(models) {
      // An entity can be the result of multiple combinations
      Entity.hasMany(models.EntityCombination, {
        foreignKey: "resultEntityId",
        as: "combinations",
      });

      // Many-to-many: Entity can be discovered by many Users
      Entity.belongsToMany(models.User, {
        through: models.UserPlaygroundEntity,
        foreignKey: "entityId",
        otherKey: "userId",
        as: "discoveredByUsers",
      });

      // Direct association with junction table
      Entity.hasMany(models.UserPlaygroundEntity, {
        foreignKey: "entityId",
        as: "userPlaygroundEntities",
      });
    }
  }

  Entity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      formula: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Entity",
      tableName: "entities",
      timestamps: true,
    }
  );

  return Entity;
};

