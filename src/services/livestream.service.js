const { Livestream, Course, Topic } = require("../models");

class LivestreamService {
  async getLivestreamBySlug(slug) {
    const livestream = await Livestream.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "url", "view"],
      include: [
        {
          association: "course",
          attributes: ["id"],
          include: [
            {
              association: "outlines",
              attributes: ["id", "title"],
              separate: true,
              order: [["order", "ASC"]],
              include: [
                {
                  association: "livestreams",
                  attributes: ["id", "title", "slug", "url", "view"],
                  separate: true,
                  order: [["order", "ASC"]],
                  include: [
                    {
                      association: "documents",
                      attributes: ["id", "slug"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    return livestream;
  }
}

module.exports = new LivestreamService();
