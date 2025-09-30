const { Document, Livestream } = require("@/models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class AdminDocumentService {
  async getAllDocuments({ page = 1, limit = 10, search, livestreamId, vip }) {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    if (livestreamId) {
      whereConditions.livestreamId = livestreamId;
    }

    if (typeof vip === "boolean") {
      whereConditions.vip = vip;
    }

    // Get documents with pagination
    const { count: total, rows: documents } = await Document.findAndCountAll({
      where: whereConditions,
      attributes: [
        "id",
        "title",
        "slug",
        "livestreamId",
        "vip",
        "downloadCount",
        "thumbnail",
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
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // Calculate stats
    const statsPromises = await Promise.all([
      Document.count({ where: whereConditions }), // total matching search/filter
      Document.count({ where: { ...whereConditions, vip: true } }), // vip documents
      Document.count({ where: { ...whereConditions, vip: false } }), // free documents
      Document.sum("downloadCount", { where: whereConditions }), // total downloads
    ]);

    const [totalFiltered, vipCount, freeCount, totalDownloads] = statsPromises;

    return {
      items: documents,
      pagination: {
        currentPage: page,
        perPage: limit,
        total: totalFiltered,
        lastPage: Math.ceil(totalFiltered / limit),
      },
      stats: {
        total: totalFiltered,
        vip: vipCount,
        free: freeCount,
        totalDownloads: totalDownloads || 0,
      },
    };
  }

  async getDocumentById(identifier) {
    // Try to find by ID first (if it's a number), then by slug
    let document;

    if (!isNaN(identifier)) {
      // It's a number, search by ID
      document = await Document.findByPk(identifier, {
        attributes: [
          "id",
          "title",
          "slug",
          "livestreamId",
          "vip",
          "downloadCount",
          "thumbnail",
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
    } else {
      // It's a slug, search by slug
      document = await Document.findOne({
        where: { slug: identifier },
        attributes: [
          "id",
          "title",
          "slug",
          "livestreamId",
          "vip",
          "downloadCount",
          "thumbnail",
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
    }

    if (!document) {
      throw new Error("Document not found");
    }

    return document;
  }

  async createDocument(documentData) {
    const { title, livestreamId, vip, thumbnail } = documentData;

    // Generate unique slug if not provided
    const slug =
      documentData.slug || (await generateUniqueSlug(title, Document));

    const document = await Document.create({
      title,
      slug,
      livestreamId,
      vip: vip || false,
      thumbnail,
      downloadCount: 0,
    });

    // Return created document with associations
    return await this.getDocumentById(document.id);
  }

  async updateDocument(id, documentData) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error("Document not found");
    }

    const { title, livestreamId, vip, thumbnail } = documentData;

    const updateData = {
      title,
      livestreamId,
      vip,
      thumbnail,
    };

    // Generate new slug if title changed
    if (title && title !== document.title) {
      updateData.slug =
        documentData.slug || (await generateUniqueSlug(title, Document, id));
    }

    await document.update(updateData);

    // Return updated document with associations
    return await this.getDocumentById(id);
  }

  async deleteDocument(id) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error("Document not found");
    }

    await document.destroy();
    return { message: "Document deleted successfully" };
  }

  async getDocumentsAnalytics() {
    const totalDocuments = await Document.count();
    const vipDocuments = await Document.count({ where: { vip: true } });
    const freeDocuments = await Document.count({ where: { vip: false } });
    const totalDownloads = await Document.sum("downloadCount");

    // Top downloaded documents
    const topDownloaded = await Document.findAll({
      attributes: ["id", "title", "slug", "downloadCount", "vip"],
      include: [
        {
          model: Livestream,
          as: "livestream",
          attributes: ["title"],
        },
      ],
      order: [["downloadCount", "DESC"]],
      limit: 10,
    });

    return {
      total: totalDocuments,
      vip: vipDocuments,
      free: freeDocuments,
      totalDownloads: totalDownloads || 0,
      topDownloaded,
    };
  }
}

module.exports = new AdminDocumentService();
