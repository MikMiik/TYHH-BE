const queueService = require("@/services/queue.service");

async function dispatch(type, payload) {
  const newQueue = {
    type,
    payload: JSON.stringify(payload),
  };
  await queueService.create(newQueue);
}

module.exports = { dispatch };
