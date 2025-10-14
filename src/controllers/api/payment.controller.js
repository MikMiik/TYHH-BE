const { sequelize } = require("@/models");

// Mock payment controller for development/demo purposes
const createMockPayment = async (req, res) => {
  try {
    const { courseId, amount, paymentMethod, simulate = "success" } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!courseId || !amount) {
      return res.error(400, "Course ID and amount are required");
    }

    // Simulate processing delay (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate payment failure occasionally (10% chance)
    const shouldFail =
      simulate === "failed" || (simulate === "random" && Math.random() < 0.1);

    if (shouldFail) {
      return res.error(
        400,
        "Payment failed: Insufficient funds or card declined",
        {
          errorCode: "payment_failed",
          details: "This is a simulated payment failure for testing purposes",
        }
      );
    }

    // Generate mock payment record
    const mockPayment = {
      id: `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "paid",
      amount: parseInt(amount, 10),
      courseId: parseInt(courseId, 10),
      userId: userId,
      paymentMethod: {
        type: paymentMethod?.type || "card",
        last4: paymentMethod?.last4 || "4242",
        brand: paymentMethod?.brand || "visa",
        name: paymentMethod?.name || "Card Holder",
      },
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      receiptUrl: `/api/v1/payments/mock/receipt/${`mock_pay_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`}`,
      metadata: {
        isMock: true,
        environment: process.env.NODE_ENV || "development",
      },
    };

    // Optional: Save to database for persistence (if you have a payments table)
    // const payment = await Payment.create(mockPayment);

    // Optional: Create enrollment record linking user to course
    try {
      // Check if enrollment already exists
      const existingEnrollment = await sequelize.query(
        `SELECT * FROM enrollments WHERE userId = :userId AND courseId = :courseId LIMIT 1`,
        {
          replacements: { userId, courseId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!existingEnrollment.length) {
        // Create new enrollment
        await sequelize.query(
          `INSERT INTO enrollments (userId, courseId, status, enrolledAt, paymentId) 
           VALUES (:userId, :courseId, 'active', NOW(), :paymentId)`,
          {
            replacements: {
              userId,
              courseId,
              paymentId: mockPayment.id,
            },
            type: sequelize.QueryTypes.INSERT,
          }
        );
      }
    } catch (enrollmentError) {
      // Log but don't fail the payment if enrollment creation fails
      console.warn(
        "Could not create enrollment record:",
        enrollmentError.message
      );
    }

    res.success(200, "Payment processed successfully", mockPayment);
  } catch (error) {
    console.error("Mock payment error:", error);
    res.error(500, "Payment processing failed", {
      error: error.message,
      isMock: true,
    });
  }
};

// Get mock payment receipt
const getMockReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Generate mock receipt data
    const receipt = {
      paymentId,
      status: "paid",
      amount: 100000, // Mock amount
      currency: "VND",
      date: new Date().toISOString(),
      description: "Course Enrollment Payment",
      merchant: "TYHH Education Platform",
      isMock: true,
    };

    res.success(200, "Receipt retrieved", receipt);
  } catch (error) {
    console.error("Mock receipt error:", error);
    res.error(500, "Could not retrieve receipt");
  }
};

// Get user's payment history (mock)
const getUserPayments = async (req, res) => {
  try {
    const userId = req.userId;

    // Mock payment history - in real app, query from database
    const mockPayments = [
      {
        id: `mock_pay_${Date.now() - 86400000}`,
        courseId: 1,
        amount: 100000,
        status: "paid",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        courseName: "Sample Course",
      },
    ];

    res.success(200, "Payment history retrieved", {
      payments: mockPayments,
      total: mockPayments.length,
      isMock: true,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.error(500, "Could not retrieve payment history");
  }
};

module.exports = {
  createMockPayment,
  getMockReceipt,
  getUserPayments,
};
