const queueService = require("@/services/queue.service");

async function dispatch(type, payload, transaction = null) {
  const newQueue = {
    type,
    payload: JSON.stringify(payload),
  };
  console.log("newQueue", newQueue);

  const options = transaction ? { transaction } : {};
  await queueService.create(newQueue, options);
}

module.exports = { dispatch };
