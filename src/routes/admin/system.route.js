const express = require("express");
const systemController = require("@/controllers/admin/systemController");
const router = express.Router();

// Site Info routes
router.get("/site-info", systemController.getSiteInfo);
router.put("/site-info", systemController.updateSiteInfo);

// Cities routes
router.get("/cities", systemController.getCities);
router.post("/cities", systemController.addCity);
router.put("/cities/:id", systemController.updateCity);
router.delete("/cities/:id", systemController.deleteCity);

// Schools routes
router.get("/schools", systemController.getSchools);
router.post("/schools", systemController.addSchool);
router.put("/schools/:id", systemController.updateSchool);
router.delete("/schools/:id", systemController.deleteSchool);

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
