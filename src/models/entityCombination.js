"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EntityCombination extends Model {
    static associate(models) {
      // A combination results in an entity
      EntityCombination.belongsTo(models.Entity, {
        foreignKey: "resultEntityId",
        as: "resultEntity",
      });
    }
  }

  EntityCombination.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      element1: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      element2: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      resultEntityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "EntityCombination",
      tableName: "entity_combinations",
      timestamps: true,
    }
  );

  return EntityCombination;
};

