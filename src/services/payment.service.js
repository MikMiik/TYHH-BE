const { CourseUser, Course, User } = require("@/models");

class PaymentService {
  // Create a mock payment and enroll the user
  async createMockPayment({
    userId,
    courseId,
    amount,
    paymentMethod,
    simulate = "success",
  }) {
    if (!courseId || !amount) {
      const err = new Error("Course ID and amount are required");
      err.status = 400;
      throw err;
    }

    // Simulate processing delay
    const delay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const shouldFail =
      simulate === "failed" || (simulate === "random" && Math.random() < 0.1);
    if (shouldFail) {
      const err = new Error(
        "Payment failed: Insufficient funds or card declined"
      );
      err.status = 400;
      err.meta = {
        errorCode: "payment_failed",
        details: "This is a simulated payment failure for testing purposes",
      };
      throw err;
    }

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

    // Enrollment creation
    try {
      const existingEnrollment = await CourseUser.findOne({
        where: { userId, courseId },
      });

      if (!existingEnrollment) {
        const course = await Course.findByPk(courseId);
        if (!course) {
          const err = new Error("Course not found");
          err.status = 404;
          throw err;
        }

        const user = await User.findByPk(userId);
        if (!user) {
          const err = new Error("User not found");
          err.status = 404;
          throw err;
        }

        const enrollment = await CourseUser.create({ userId, courseId });
        mockPayment.enrollment = {
          id: enrollment.id,
          courseId: enrollment.courseId,
          userId: enrollment.userId,
          enrolledAt: enrollment.createdAt,
        };
      } else {
        mockPayment.enrollment = {
          id: existingEnrollment.id,
          courseId: existingEnrollment.courseId,
          userId: existingEnrollment.userId,
          enrolledAt: existingEnrollment.createdAt,
        };
      }
    } catch (enrollmentError) {
      const err = new Error("Payment succeeded but enrollment failed");
      err.status = 500;
      err.meta = { error: enrollmentError.message, payment: mockPayment };
      throw err;
    }

    return mockPayment;
  }

  async getMockReceipt(paymentId) {
    return {
      paymentId,
      status: "paid",
      amount: 100000,
      currency: "VND",
      date: new Date().toISOString(),
      description: "Course Enrollment Payment",
      merchant: "TYHH Education Platform",
      isMock: true,
    };
  }

  async getUserPayments(userId) {
    // Return mock history - replace with DB logic if needed
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

    return {
      payments: mockPayments,
      total: mockPayments.length,
      isMock: true,
    };
  }

  async checkEnrollment(userId, courseId) {
    const enrollment = await CourseUser.findOne({
      where: { userId, courseId: parseInt(courseId, 10) },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    if (enrollment) {
      return {
        enrolled: true,
        enrollment: {
          id: enrollment.id,
          enrolledAt: enrollment.createdAt,
          course: enrollment.course,
        },
      };
    }

    return { enrolled: false };
  }
}

module.exports = new PaymentService();
