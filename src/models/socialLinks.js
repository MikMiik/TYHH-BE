const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SocialLinks extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  SocialLinks.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      platformCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      platformName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SocialLinks",
      tableName: "socialLinks",
      paranoid: true,
    }
  );
  return SocialLinks;
};
