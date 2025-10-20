"use strict";
const getCurrentUserId = require("@/utils/getCurrentUserId");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.Livestream, {
        foreignKey: "livestreamId",
        as: "livestream",
      });
    }
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
      slug: { type: DataTypes.STRING(255), allowNull: true, unique: true },
      downloadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      url: { type: DataTypes.STRING(255), allowNull: true },
      slidenote: { type: DataTypes.STRING(255), allowNull: true },
      thumbnail: { type: DataTypes.STRING(255), allowNull: true },
      isEnrolled: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isEnrolled");
        },
        set(value) {
          this.setDataValue("isEnrolled", value);
        },
      },
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

  // Hook to populate isEnrolled field
  Document.addHook("afterFind", async (result, options) => {
    if (options?.skipIsEnrolled) return;
    const userId = getCurrentUserId();

    const { CourseUser, Livestream } = sequelize.models;

    const documents = Array.isArray(result) ? result : result ? [result] : [];
    if (documents.length === 0) return;

    // Only process Sequelize model instances
    const validDocuments = documents.filter(
      (document) => document && typeof document.setDataValue === "function"
    );

    if (!userId) {
      validDocuments.forEach((doc) => doc.setDataValue("isEnrolled", false));
    } else {
      // Get livestreamIds from documents
      const livestreamIds = validDocuments
        .map((doc) => doc.livestreamId)
        .filter((id) => id !== null && id !== undefined);

      if (livestreamIds.length === 0) {
        validDocuments.forEach((doc) => doc.setDataValue("isEnrolled", false));
        return;
      }

      // Get courses from livestreams
      const livestreams = await Livestream.findAll({
        where: { id: livestreamIds },
        attributes: ["id", "courseId"],
        raw: true,
      });

      const livestreamToCourseMap = {};
      livestreams.forEach((ls) => {
        livestreamToCourseMap[ls.id] = ls.courseId;
      });

      // Get unique courseIds
      const courseIds = [
        ...new Set(livestreams.map((ls) => ls.courseId)),
      ].filter((id) => id !== null && id !== undefined);

      if (courseIds.length === 0) {
        validDocuments.forEach((doc) => doc.setDataValue("isEnrolled", false));
        return;
      }

      // Check enrollment for all courses at once
      const enrollments = await CourseUser.findAll({
        where: {
          userId,
          courseId: courseIds,
        },
        attributes: ["courseId"],
        raw: true,
      });

      const enrolledCourseIds = new Set(
        enrollments.map((e) => e.courseId)
      );

      // Set isEnrolled for each document
      validDocuments.forEach((doc) => {
        const courseId = livestreamToCourseMap[doc.livestreamId];
        const isEnrolled = courseId && enrolledCourseIds.has(courseId);
        doc.setDataValue("isEnrolled", isEnrolled || false);
      });
    }
  });

  return Document;
};
