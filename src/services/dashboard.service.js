const {
  User,
  Course,
  Livestream,
  Document,
  Topic,
  CourseUser,
  sequelize,
} = require("@/models");
const { Op } = require("sequelize");

class AdminDashboardService {
  // Overview Statistics
  async getOverviewStats() {
    const [
      totalUsers,
      totalCourses,
      totalLivestreams,
      totalDocuments,
      totalTopics,
      activeUsers,
      activeCourses,
      totalEnrollments,
      totalViews,
      totalDownloads,
    ] = await Promise.all([
      User.count(),
      Course.count(),
      Livestream.count(),
      Document.count(),
      Topic.count(),
      User.count({ where: { status: "active" } }),
      Course.count({ where: { deletedAt: null } }),
      CourseUser.count(),
      Livestream.sum("view") || 0,
      Document.sum("downloadCount") || 0,
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      courses: { total: totalCourses, active: activeCourses },
      livestreams: { total: totalLivestreams, totalViews },
      documents: { total: totalDocuments, totalDownloads },
      topics: { total: totalTopics },
      enrollments: { total: totalEnrollments },
    };
  }

  // User Analytics
  async getUserAnalytics() {
    // User registrations by month (last 12 months)
    const monthlyRegistrations = await User.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)"),
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // User status distribution
    const userStatusDistribution = await User.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Top users by enrollments
    const topUsersByEnrollments = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        [
          sequelize.fn("COUNT", sequelize.col("registeredCourses.id")),
          "enrollments",
        ],
      ],
      include: [
        {
          model: Course,
          as: "registeredCourses",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["User.id"],
      order: [
        [sequelize.fn("COUNT", sequelize.col("registeredCourses.id")), "DESC"],
      ],
      limit: 10,
      subQuery: false,
    });

    return {
      monthlyRegistrations,
      statusDistribution: userStatusDistribution,
      topUsers: topUsersByEnrollments,
    };
  }

  // Course Analytics
  async getCourseAnalytics() {
    // Course creation by month
    const monthlyCourses = await Course.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)"),
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Course price distribution
    const coursePriceDistribution = await Course.findAll({
      attributes: [
        [
          sequelize.literal(`
          CASE 
            WHEN isFree = 1 THEN 'Free'
            WHEN price = 0 THEN 'Free'
            WHEN price <= 500000 THEN '0-500K'
            WHEN price <= 1000000 THEN '500K-1M'
            WHEN price <= 2000000 THEN '1M-2M'
            ELSE '2M+'
          END
        `),
          "priceRange",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [
        sequelize.literal(`
        CASE 
          WHEN isFree = 1 THEN 'Free'
          WHEN price = 0 THEN 'Free'
          WHEN price <= 500000 THEN '0-500K'
          WHEN price <= 1000000 THEN '500K-1M'
          WHEN price <= 2000000 THEN '1M-2M'
          ELSE '2M+'
        END
      `),
      ],
      raw: true,
    });

    // Top courses by enrollments
    const topCoursesByEnrollments = await Course.findAll({
      attributes: [
        "id",
        "title",
        "price",
        "isFree",
        [sequelize.fn("COUNT", sequelize.col("students.id")), "enrollments"],
      ],
      include: [
        {
          model: User,
          as: "students",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Course.id"],
      order: [[sequelize.fn("COUNT", sequelize.col("students.id")), "DESC"]],
      limit: 10,
      subQuery: false,
    });

    // Topics popularity
    const topicsPopularity = await Topic.findAll({
      attributes: [
        "id",
        "title",
        [sequelize.fn("COUNT", sequelize.col("courses.id")), "courseCount"],
      ],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Topic.id"],
      order: [[sequelize.fn("COUNT", sequelize.col("courses.id")), "DESC"]],
      limit: 10,
      subQuery: false,
    });

    return {
      monthlyCourses,
      priceDistribution: coursePriceDistribution,
      topCourses: topCoursesByEnrollments,
      topicsPopularity,
    };
  }

  // Livestream Analytics
  async getLivestreamAnalytics() {
    // Livestream creation by month
    const monthlyLivestreams = await Livestream.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)"),
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Top livestreams by views
    const topLivestreamsByViews = await Livestream.findAll({
      attributes: ["id", "title", "view"],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["title"],
        },
      ],
      order: [["view", "DESC"]],
      limit: 10,
    });

    // Views by course
    const viewsByCourse = await Course.findAll({
      attributes: [
        "id",
        "title",
        [sequelize.fn("SUM", sequelize.col("livestreams.view")), "totalViews"],
      ],
      include: [
        {
          model: Livestream,
          as: "livestreams",
          attributes: [],
        },
      ],
      group: ["Course.id"],
      order: [[sequelize.fn("SUM", sequelize.col("livestreams.view")), "DESC"]],
      limit: 10,
      subQuery: false,
    });

    return {
      monthlyLivestreams,
      topLivestreams: topLivestreamsByViews,
      viewsByCourse,
    };
  }

  // Document Analytics
  async getDocumentAnalytics() {
    // Document creation by month
    const monthlyDocuments = await Document.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)"),
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // VIP vs Free documents
    const documentTypeDistribution = await Document.findAll({
      attributes: [
        [
          sequelize.literal('CASE WHEN vip = 1 THEN "VIP" ELSE "Free" END'),
          "type",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [
        sequelize.literal('CASE WHEN vip = 1 THEN "VIP" ELSE "Free" END'),
      ],
      raw: true,
    });

    // Top documents by downloads
    const topDocumentsByDownloads = await Document.findAll({
      attributes: ["id", "title", "downloadCount", "vip"],
      include: [
        {
          model: Livestream,
          as: "livestream",
          attributes: ["title"],
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["title"],
            },
          ],
        },
      ],
      order: [["downloadCount", "DESC"]],
      limit: 10,
    });

    return {
      monthlyDocuments,
      typeDistribution: documentTypeDistribution,
      topDocuments: topDocumentsByDownloads,
    };
  }

  // Activity Analytics (Recent activities)
  async getRecentActivities() {
    const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
      User.findAll({
        attributes: ["id", "name", "email", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Course.findAll({
        attributes: ["id", "title", "createdAt"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      CourseUser.findAll({
        attributes: ["createdAt"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name"],
          },
          {
            model: Course,
            as: "course",
            attributes: ["title"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),
    ]);

    return {
      recentUsers,
      recentCourses,
      recentEnrollments,
    };
  }

  // Growth Analytics (comparing periods)
  async getGrowthAnalytics() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [
      currentMonthUsers,
      lastMonthUsers,
      currentMonthCourses,
      lastMonthCourses,
      currentMonthEnrollments,
      lastMonthEnrollments,
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: lastMonth } } }),
      User.count({
        where: {
          createdAt: {
            [Op.gte]: twoMonthsAgo,
            [Op.lt]: lastMonth,
          },
        },
      }),
      Course.count({ where: { createdAt: { [Op.gte]: lastMonth } } }),
      Course.count({
        where: {
          createdAt: {
            [Op.gte]: twoMonthsAgo,
            [Op.lt]: lastMonth,
          },
        },
      }),
      CourseUser.count({ where: { createdAt: { [Op.gte]: lastMonth } } }),
      CourseUser.count({
        where: {
          createdAt: {
            [Op.gte]: twoMonthsAgo,
            [Op.lt]: lastMonth,
          },
        },
      }),
    ]);

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      users: {
        current: currentMonthUsers,
        previous: lastMonthUsers,
        growth: calculateGrowth(currentMonthUsers, lastMonthUsers),
      },
      courses: {
        current: currentMonthCourses,
        previous: lastMonthCourses,
        growth: calculateGrowth(currentMonthCourses, lastMonthCourses),
      },
      enrollments: {
        current: currentMonthEnrollments,
        previous: lastMonthEnrollments,
        growth: calculateGrowth(currentMonthEnrollments, lastMonthEnrollments),
      },
    };
  }

  // Complete Dashboard Data
  async getDashboardData() {
    const [
      overview,
      userAnalytics,
      courseAnalytics,
      livestreamAnalytics,
      documentAnalytics,
      recentActivities,
      growthAnalytics,
    ] = await Promise.all([
      this.getOverviewStats(),
      this.getUserAnalytics(),
      this.getCourseAnalytics(),
      this.getLivestreamAnalytics(),
      this.getDocumentAnalytics(),
      this.getRecentActivities(),
      this.getGrowthAnalytics(),
    ]);

    return {
      overview,
      users: userAnalytics,
      courses: courseAnalytics,
      livestreams: livestreamAnalytics,
      documents: documentAnalytics,
      activities: recentActivities,
      growth: growthAnalytics,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AdminDashboardService();
