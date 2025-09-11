const { Document, sequelize } = require("../models");
const { Op } = require("sequelize");

class DocumentService {
  async getAllDocuments({ limit, offset, vip, sort = "newest", topic }) {
    let whereClause = {};

    whereClause.vip = vip;

    // Xử lý sort order
    let orderClause = [];
    switch (sort) {
      case "oldest":
        orderClause = [["createdAt", "ASC"]];
        break;
      case "popularity":
        orderClause = [["downloadCount", "DESC"]];
        break;
      case "newest":
      default:
        orderClause = [["createdAt", "DESC"]];
        break;
    }
    // Nếu có topic filter, sử dụng subquery thay vì nested include
    if (topic) {
      whereClause[Op.and] = [
        sequelize.literal(`
          EXISTS (
            SELECT 1 FROM livestreams l
            JOIN courses c ON l.courseId = c.id
            JOIN course_topic ct ON c.id = ct.courseId
            JOIN topics t ON ct.topicId = t.id
            WHERE l.id = Document.livestreamId AND t.slug = '${topic}'
          )
        `),
      ];
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: orderClause,
      attributes: [
        "id",
        "title",
        "thumbnail",
        "slug",
        "downloadCount",
        "vip",
        "livestreamId",
        "createdAt",
      ],
      include: [
        {
          association: "livestream",
          attributes: ["id"],
          required: false,
          include: [
            {
              association: "course",
              attributes: ["id"],
              required: false,
              include: [
                {
                  association: "topics",
                  attributes: ["id", "title", "slug"],
                  through: { attributes: [] },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    // Trả về cấu trúc { documents, totalPages }
    let docs = documents.map((doc) => {
      const docJson = doc.toJSON();
      const { livestream, ...docFields } = docJson;
      const topics = livestream?.course?.topics || [];
      return {
        ...docFields,
        topics,
      };
    });

    const totalPages = Math.ceil(count / limit);
    // Nếu page vượt quá totalPages thì trả về mảng rỗng
    if (offset / limit + 1 > totalPages) {
      return { documents: [], totalPages };
    }

    return { documents: docs, totalPages };
  }
  async getDocumentBySlug(slug) {
    const document = await Document.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "downloadCount", "vip", "createdAt"],
      include: [
        {
          association: "livestream",
          attributes: ["id", "title", "slug", "view"],
          required: false,
          include: [
            {
              association: "course",
              attributes: ["id", "title", "slug"],
              required: false,
              include: [
                {
                  association: "topics",
                  attributes: ["id", "title", "slug"],
                  through: { attributes: [] },
                  required: false,
                },
              ],
            },
            {
              association: "documents",
              attributes: ["id", "slug", "title"],
              where: { slug: { [Op.ne]: slug } },
              required: false,
            },
          ],
        },
      ],
    });

    return document;
  }
}

module.exports = new DocumentService();
