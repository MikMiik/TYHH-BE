const { Queue } = require("@/models");

class QueueService {
  async getPendingJobs() {
    const jobs = await Queue.findAll({
      where: { status: "pending" },
      raw: true,
    });
    return jobs;
  }
  async create(data, options = {}) {
    const queue = await Queue.create(data, options);
    return queue;
  }

  async update(id, data) {
    const queue = await Queue.update(data, { where: { id } });
    return queue;
  }

  async remove(id) {
    const result = await Queue.destroy({ where: { id } });
    return result;
  }
}

module.exports = new QueueService();
