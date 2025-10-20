const {
  Document,
  Livestream,
  Course,
  CourseOutline,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class DocumentService {
  // API: Get all documents (public, filtered)
  async getAllDocuments({
    limit,
    offset,
    vip,
    sort = "newest",
    topic,
    search = "",
  }) {
    let whereClause = { vip };
    if (search) {
      whereClause[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }
    // Sort order
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

    // Topic filter with subquery
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
      limit,
      offset,
      where: whereClause,
      order: orderClause,
      distinct: true,
      attributes: [
        "id",
        "title",
        "slug",
        "downloadCount",
        "vip",
        "thumbnail",
        "createdAt",
        "isEnrolled",
      ],
    });

    const totalPages = Math.ceil(count / limit);
    if (offset / limit + 1 > totalPages) {
      return { documents: [], totalPages };
    }
    return { documents, totalPages };
  }

  // API: Get document by slug
  async getDocumentBySlug(slug) {
    return await Document.findOne({
      where: { slug },
      attributes: {
        exclude: ["updatedAt", "deletedAt"],
        // Explicitly include all fields needed for DocumentDetail
        include: ["slidenote", "url"],
      },
      include: [
        {
          association: "livestream",
          attributes: ["id", "title", "slug", "view"],
          include: [
            {
              association: "course",
              attributes: ["id", "title", "slug"],
              include: [
                { association: "teacher", attributes: ["id", "name"] },
                { association: "topics", attributes: ["id", "title", "slug"] },
              ],
            },
            {
              association: "documents",
              attributes: ["id", "title", "slug"],
              where: { slug: { [Op.ne]: slug } },
            },
          ],
        },
      ],
    });
  }

  // API: Increment download count
  async incrementDownloadCount(id) {
    await Document.increment("downloadCount", { where: { id } });
    return true;
  }

  // ADMIN: Get all documents with pagination
  async getAllDocumentsAdmin({
    page = 1,
    limit = 10,
    search,
    vip,
    livestreamId,
  }) {
    const offset = (page - 1) * limit;
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }

    if (typeof vip === "boolean") whereConditions.vip = vip;
    if (livestreamId) whereConditions.livestreamId = livestreamId;

    const { count: total, rows: items } = await Document.findAndCountAll({
      where: whereConditions,
      attributes: [
        "id",
        "title",
        "slug",
        "thumbnail",
        "url",
        "downloadCount",
        "vip",
        "livestreamId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Livestream,
          as: "livestream",
          attributes: ["id", "title", "slug"],
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title", "slug"],
            },
            {
              model: CourseOutline,
              as: "courseOutline",
              attributes: ["id", "title", "slug"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // Get stats
    const [totalDocs, vipDocs, freeDocs, totalDownloads] = await Promise.all([
      Document.count({ where: whereConditions }),
      Document.count({ where: { ...whereConditions, vip: true } }),
      Document.count({ where: { ...whereConditions, vip: false } }),
      Document.sum("downloadCount", { where: whereConditions }),
    ]);

    return {
      items,
      pagination: {
        currentPage: page,
        perPage: limit,
        total: totalDocs,
        lastPage: Math.ceil(totalDocs / limit),
      },
      stats: {
        total: totalDocs,
        vip: vipDocs,
        free: freeDocs,
        totalDownloads: totalDownloads || 0,
      },
    };
  }

  // ADMIN: Get document by ID
  async getDocumentById(id) {
    const document = await Document.findByPk(id, {
      attributes: [
        "id",
        "title",
        "slug",
        "thumbnail",
        "url",
        "downloadCount",
        "vip",
        "livestreamId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Livestream,
          as: "livestream",
          attributes: ["id", "title", "slug"],
          include: [
            {
              association: "course",
              attributes: ["id", "title", "slug"],
            },
          ],
        },
      ],
    });

    if (!document) throw new Error("Document not found");
    return document;
  }

  // ADMIN: Get document by ID or slug
  async getDocumentByIdOrSlug(identifier) {
    // Check if identifier is numeric (ID)
    const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    const whereCondition = isNumeric
      ? { id: identifier }
      : { slug: identifier };

    const document = await Document.findOne({
      where: whereCondition,
      attributes: [
        "id",
        "title",
        "slug",
        "thumbnail",
        "url",
        "downloadCount",
        "vip",
        "livestreamId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Livestream,
          as: "livestream",
          attributes: ["id", "title", "slug"],
          include: [
            {
              association: "course",
              attributes: ["id", "title", "slug"],
            },
            {
              association: "courseOutline",
              attributes: ["id", "title", "slug"],
            },
          ],
        },
      ],
    });

    if (!document) throw new Error("Document not found");
    return document;
  }

  async createDocument(documentData) {
    const {
      title,
      vip = false,
      livestreamId,
      url,
      thumbnail,
      slidenote,
    } = documentData;

    if (livestreamId) {
      const livestream = await Livestream.findByPk(livestreamId);
      if (!livestream) throw new Error("Livestream not found");
    }

    const slug = await generateUniqueSlug(title, Document);

    const document = await Document.create({
      title,
      slug,
      vip,
      livestreamId,
      url,
      thumbnail,
      slidenote,
    });

    return await this.getDocumentById(document.id);
  }

  // ADMIN: Update document
  async updateDocument(id, documentData) {
    const document = await Document.findByPk(id);
    if (!document) throw new Error("Document not found");

    const { title, vip, livestreamId, url, thumbnail } = documentData;

    if (livestreamId && livestreamId !== document.livestreamId) {
      const livestream = await Livestream.findByPk(livestreamId);
      if (!livestream) throw new Error("Livestream not found");
    }

    let updateData = { vip, livestreamId, url, thumbnail };

    if (title && title !== document.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, Document, id);
    }

    await document.update(updateData);
    return await this.getDocumentById(id);
  }

  async deleteDocument(id) {
    const document = await Document.findByPk(id);
    if (!document) throw new Error("Document not found");

    await document.destroy();
    return true;
  }

  // Bulk delete documents
  async bulkDeleteDocuments(ids) {
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("IDs array is required and must not be empty");
    }

    const deletedRowsCount = await Document.destroy({
      where: { id: { [Op.in]: ids } },
    });

    return {
      deletedCount: deletedRowsCount,
      message: `Successfully deleted ${deletedRowsCount} document(s)`,
    };
  }

  // ADMIN: Analytics
  async getDocumentsAnalytics() {
    const [totalDocuments, vipDocuments, freeDocuments, totalDownloads] =
      await Promise.all([
        Document.count(),
        Document.count({ where: { vip: true } }),
        Document.count({ where: { vip: false } }),
        Document.sum("downloadCount"),
      ]);

    return {
      total: totalDocuments,
      vip: vipDocuments,
      free: freeDocuments,
      totalDownloads: totalDownloads || 0,
    };
  }
}

module.exports = new DocumentService();
