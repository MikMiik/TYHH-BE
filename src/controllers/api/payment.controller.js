const PaymentService = require("@/services/payment.service");

// Mock payment controller - thin wrappers that delegate to PaymentService
const createMockPayment = async (req, res) => {
  try {
    const { courseId, amount, paymentMethod, simulate = "success" } = req.body;
    const userId = req.userId;

    const payment = await PaymentService.createMockPayment({
      userId,
      courseId,
      amount,
      paymentMethod,
      simulate,
    });

    return res.success(200, payment, "Payment processed successfully");
  } catch (err) {
    console.error("Mock payment error:", err?.message || err);
    const status = err && err.status ? err.status : 500;
    const meta =
      err && err.meta ? err.meta : { error: err?.message, isMock: true };
    return res.error(status, err.message || "Payment processing failed", meta);
  }
};

const getMockReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const receipt = await PaymentService.getMockReceipt(paymentId);
    return res.success(200, receipt, "Receipt retrieved");
  } catch (err) {
    console.error("Mock receipt error:", err?.message || err);
    return res.error(500, "Could not retrieve receipt");
  }
};

const getUserPayments = async (req, res) => {
  try {
    const userId = req.userId;
    const payments = await PaymentService.getUserPayments(userId);
    return res.success(200, payments, "Payment history retrieved");
  } catch (err) {
    console.error("Get payments error:", err?.message || err);
    return res.error(500, "Could not retrieve payment history");
  }
};

const checkEnrollment = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    const result = await PaymentService.checkEnrollment(userId, courseId);
    const message =
      result && result.enrolled ? "User is enrolled" : "User is not enrolled";
    return res.success(200, result, message);
  } catch (err) {
    console.error("Check enrollment error:", err?.message || err);
    return res.error(500, "Could not check enrollment status");
  }
};

module.exports = {
  createMockPayment,
  getMockReceipt,
  getUserPayments,
  checkEnrollment,
};
