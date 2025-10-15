const express = require("express");
const router = express.Router();
const paymentController = require("@/controllers/api/payment.controller");
const { requireAuth } = require("@/middlewares/auth");

// All payment routes require authentication
router.use(requireAuth);

// Mock payment routes for development/demo
router.post("/mock", paymentController.createMockPayment);
router.get("/mock/receipt/:paymentId", paymentController.getMockReceipt);
router.get("/history", paymentController.getUserPayments);

// Check enrollment status for a course
router.get("/enrollment/:courseId", paymentController.checkEnrollment);

module.exports = router;
