const express = require("express");
const systemController = require("@/controllers/admin/systemController");
const router = express.Router();

// Roles routes
router.get("/roles", systemController.getRoles);

// Socials routes
router.get("/socials", systemController.getSocials);
router.post("/socials", systemController.addSocial);
router.put("/socials/:id", systemController.updateSocial);
router.delete("/socials/:id", systemController.deleteSocial);

// Cities routes
router.get("/cities", systemController.getCities);
router.post("/cities", systemController.addCity);
router.put("/cities/:id", systemController.updateCity);
router.delete("/cities/:id", systemController.deleteCity);

// Topics routes
router.get("/topics", systemController.getTopics);
router.post("/topics", systemController.addTopic);
router.put("/topics/:id", systemController.updateTopic);
router.delete("/topics/:id", systemController.deleteTopic);

// Notifications routes
router.get("/notifications", systemController.getNotifications);
router.post("/notifications", systemController.addNotification);
router.put("/notifications/:id", systemController.updateNotification);
router.delete("/notifications/:id", systemController.deleteNotification);

// Queue/Background Jobs routes
router.get("/queue", systemController.getQueue);
router.get("/queue/stats", systemController.getQueueStats);
router.post("/queue/:id/retry", systemController.retryQueueJob);
router.delete("/queue/:id", systemController.deleteQueueJob);

module.exports = router;
