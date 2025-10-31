const PlaygroundService = require("@/services/playground.service");

exports.getAllElements = async (req, res) => {
  const allElements = await PlaygroundService.getElements();
  res.success(200, allElements);
};

exports.getUserEntities = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    const entities = await PlaygroundService.getUserEntities(userId);
    res.success(200, entities);
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.combineElements = async (req, res) => {
  try {
    const { element1, element2 } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    if (!element1 || !element2) {
      return res.error(400, "Both element1 and element2 are required");
    }

    const result = await PlaygroundService.combineElements(element1, element2, userId);
    res.success(200, result);
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.removeUserEntity = async (req, res) => {
  try {
    const { entityId } = req.params;
    const userId = req.user.id;

    if (!entityId) {
      return res.error(400, "Entity ID is required");
    }

    await PlaygroundService.removeUserEntity(userId, parseInt(entityId));
    res.success(200, { message: "Entity removed from your playground" });
  } catch (error) {
    res.error(500, error.message);
  }
};
