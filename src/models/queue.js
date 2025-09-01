"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Queue extends Model {
    static associate(models) {}
  }
  Queue.init(
    {
      status: {
        type: DataTypes.STRING(50),
        defaultValue: "pending",
      },

      type: DataTypes.STRING(100),

      payload: DataTypes.TEXT,

      maxRetries: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },

      retriesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Queue",
      tableName: "queues",
      timestamps: true,
    }
  );
  return Queue;
};
