/**
 * Demo: Stage 2 Error Factories in Action
 *
 * This demo shows how the new error factory utilities make it much easier
 * to create consistent, domain-specific error types.
 */

import {
  createErrorFactory,
  chainError,
  EntityError,
  AmountError,
  ExternalError,
  ValidationError,
  createEntityError,
  createAmountError,
  createExternalError,
  createValidationError,
  isErrorOfType,
  isErrorOfTypes,
  filterErrors,
  partitionResults,
  getErrorSummary,
  createErrorReport,
  trySync,
  tryAsync,
  isErr,
  TryError,
  TryResult,
} from "../src/index";

// ============================================================================
// 1. E-COMMERCE DOMAIN ERRORS
// ============================================================================

// Define error types for an e-commerce application
type UserErrorType = "UserNotFound" | "UserSuspended" | "UserLimitExceeded";
type PaymentErrorType =
  | "CardDeclined"
  | "InsufficientFunds"
  | "ProcessingError";
type InventoryErrorType = "OutOfStock" | "ReservedItem" | "InvalidProduct";

// Create domain-specific error interfaces
interface UserError extends EntityError<UserErrorType, "user"> {
  readonly accountStatus?: string;
  readonly suspensionReason?: string;
}

interface PaymentError extends AmountError<PaymentErrorType> {
  readonly transactionId: string;
  readonly cardLast4?: string;
  readonly provider: string;
}

interface InventoryError extends EntityError<InventoryErrorType, "product"> {
  readonly requestedQuantity: number;
  readonly availableQuantity: number;
  readonly restockDate?: Date;
}

// ============================================================================
// 2. CREATE DOMAIN-SPECIFIC FACTORIES
// ============================================================================

// Create factories with sensible defaults for each domain
const createUserError = createErrorFactory<UserErrorType, UserError>({
  entityType: "user",
});

const createPaymentError = createErrorFactory<PaymentErrorType, PaymentError>({
  provider: "stripe", // Default payment provider
  currency: "USD", // Default currency
});

const createInventoryError = createErrorFactory<
  InventoryErrorType,
  InventoryError
>({
  entityType: "product",
});

// ============================================================================
// 3. BUSINESS LOGIC WITH DOMAIN ERRORS
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended" | "limited";
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  userId: string;
  productId: string;
  quantity: number;
  amount: number;
}

// Mock services that use our domain-specific errors
class UserService {
  private users: Map<string, User> = new Map([
    [
      "user_1",
      {
        id: "user_1",
        name: "John Doe",
        email: "john@example.com",
        status: "active",
      },
    ],
    [
      "user_2",
      {
        id: "user_2",
        name: "Jane Smith",
        email: "jane@example.com",
        status: "suspended",
      },
    ],
    [
      "user_3",
      {
        id: "user_3",
        name: "Bob Wilson",
        email: "bob@example.com",
        status: "limited",
      },
    ],
  ]);

  getUser(userId: string): TryResult<User, UserError> {
    const result = trySync(() => {
      const user = this.users.get(userId);
      if (!user) {
        throw createUserError("UserNotFound", "User not found", {
          entityId: userId,
        });
      }

      if (user.status === "suspended") {
        throw createUserError("UserSuspended", "User account is suspended", {
          entityId: userId,
          accountStatus: user.status,
          suspensionReason: "Policy violation",
        });
      }

      if (user.status === "limited") {
        throw createUserError("UserLimitExceeded", "User has exceeded limits", {
          entityId: userId,
          accountStatus: user.status,
        });
      }

      return user;
    });

    return result as TryResult<User, UserError>;
  }
}

class InventoryService {
  private products: Map<string, Product> = new Map([
    ["prod_1", { id: "prod_1", name: "Widget A", price: 29.99, stock: 10 }],
    ["prod_2", { id: "prod_2", name: "Widget B", price: 49.99, stock: 0 }],
    ["prod_3", { id: "prod_3", name: "Widget C", price: 19.99, stock: 5 }],
  ]);

  checkAvailability(
    productId: string,
    quantity: number
  ): TryResult<Product, InventoryError> {
    return trySync(() => {
      const product = this.products.get(productId);
      if (!product) {
        throw createInventoryError("InvalidProduct", "Product not found", {
          entityId: productId,
          requestedQuantity: quantity,
          availableQuantity: 0,
        });
      }

      if (product.stock === 0) {
        throw createInventoryError("OutOfStock", "Product is out of stock", {
          entityId: productId,
          requestedQuantity: quantity,
          availableQuantity: 0,
          restockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
      }

      if (product.stock < quantity) {
        throw createInventoryError(
          "ReservedItem",
          "Insufficient stock available",
          {
            entityId: productId,
            requestedQuantity: quantity,
            availableQuantity: product.stock,
          }
        );
      }

      return product;
    });
  }
}

class PaymentService {
  async processPayment(
    amount: number,
    cardLast4: string
  ): Promise<TryResult<string, PaymentError>> {
    return tryAsync(async () => {
      // Simulate different payment scenarios
      if (cardLast4 === "0000") {
        throw createPaymentError(
          "CardDeclined",
          "Card was declined by issuer",
          {
            amount,
            transactionId: `tx_${Date.now()}`,
            cardLast4,
          }
        );
      }

      if (amount > 1000) {
        throw createPaymentError("InsufficientFunds", "Insufficient funds", {
          amount,
          transactionId: `tx_${Date.now()}`,
          cardLast4,
        });
      }

      if (Math.random() < 0.1) {
        // 10% chance of processing error
        throw createPaymentError(
          "ProcessingError",
          "Payment processing failed",
          {
            amount,
            transactionId: `tx_${Date.now()}`,
            cardLast4,
          }
        );
      }

      return `tx_${Date.now()}_success`;
    });
  }
}

// ============================================================================
// 4. ORDER PROCESSING WITH ERROR CHAINING
// ============================================================================

type OrderError = UserError | InventoryError | PaymentError;

class OrderService {
  constructor(
    private userService: UserService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService
  ) {}

  async processOrder(
    order: Order,
    cardLast4: string
  ): Promise<TryResult<string, OrderError>> {
    // Step 1: Validate user
    const userResult = this.userService.getUser(order.userId);
    if (isErr(userResult)) {
      return userResult;
    }

    // Step 2: Check inventory
    const inventoryResult = this.inventoryService.checkAvailability(
      order.productId,
      order.quantity
    );
    if (isErr(inventoryResult)) {
      return inventoryResult;
    }

    // Step 3: Process payment
    const paymentResult = await this.paymentService.processPayment(
      order.amount,
      cardLast4
    );
    if (isErr(paymentResult)) {
      return paymentResult;
    }

    return `order_${Date.now()}_${paymentResult}`;
  }
}

// ============================================================================
// 5. DEMO FUNCTIONS
// ============================================================================

function demoBasicFactories() {
  console.log("🏭 Basic Error Factories Demo");
  console.log("=".repeat(50));

  // Show how factories eliminate boilerplate
  const userError = createUserError("UserNotFound", "User not found", {
    entityId: "user_123",
  });

  const paymentError = createPaymentError("CardDeclined", "Card declined", {
    amount: 99.99,
    transactionId: "tx_456",
    cardLast4: "4242",
  });

  const inventoryError = createInventoryError(
    "OutOfStock",
    "Product out of stock",
    {
      entityId: "prod_789",
      requestedQuantity: 5,
      availableQuantity: 0,
    }
  );

  console.log("\n📝 User Error:");
  console.log(`   Type: ${userError.type}`);
  console.log(`   Entity: ${userError.entityType}:${userError.entityId}`);
  console.log(`   Source: ${userError.source}`);

  console.log("\n💳 Payment Error:");
  console.log(`   Type: ${paymentError.type}`);
  console.log(`   Amount: ${paymentError.currency} ${paymentError.amount}`);
  console.log(`   Transaction: ${paymentError.transactionId}`);
  console.log(`   Provider: ${paymentError.provider}`);

  console.log("\n📦 Inventory Error:");
  console.log(`   Type: ${inventoryError.type}`);
  console.log(`   Product: ${inventoryError.entityId}`);
  console.log(`   Requested: ${inventoryError.requestedQuantity}`);
  console.log(`   Available: ${inventoryError.availableQuantity}`);
}

async function demoOrderProcessing() {
  console.log("\n\n🛒 Order Processing Demo");
  console.log("=".repeat(50));

  const userService = new UserService();
  const inventoryService = new InventoryService();
  const paymentService = new PaymentService();
  const orderService = new OrderService(
    userService,
    inventoryService,
    paymentService
  );

  const testOrders = [
    {
      userId: "user_1",
      productId: "prod_1",
      quantity: 2,
      amount: 59.98,
      cardLast4: "4242",
    }, // Success
    {
      userId: "user_999",
      productId: "prod_1",
      quantity: 1,
      amount: 29.99,
      cardLast4: "4242",
    }, // User not found
    {
      userId: "user_2",
      productId: "prod_1",
      quantity: 1,
      amount: 29.99,
      cardLast4: "4242",
    }, // User suspended
    {
      userId: "user_1",
      productId: "prod_2",
      quantity: 1,
      amount: 49.99,
      cardLast4: "4242",
    }, // Out of stock
    {
      userId: "user_1",
      productId: "prod_1",
      quantity: 1,
      amount: 29.99,
      cardLast4: "0000",
    }, // Card declined
  ];

  const results: Array<TryResult<string, OrderError>> = [];

  for (let i = 0; i < testOrders.length; i++) {
    const order = testOrders[i];
    console.log(
      `\n🧪 Order ${i + 1}: User ${order.userId}, Product ${order.productId}`
    );

    const result = await orderService.processOrder(order, order.cardLast4);
    results.push(result);

    if (isErr(result)) {
      console.log(`   ❌ ${result.type}: ${result.message}`);

      // Type-safe error handling based on domain
      if (isErrorOfType(result, "UserNotFound")) {
        console.log(`   👤 User ${result.entityId} needs to be created`);
      } else if (isErrorOfType(result, "UserSuspended")) {
        console.log(`   🚫 User suspended: ${result.suspensionReason}`);
      } else if (isErrorOfTypes(result, ["OutOfStock", "ReservedItem"])) {
        console.log(
          `   📦 Stock issue: ${result.availableQuantity} available, ${result.requestedQuantity} requested`
        );
      } else if (
        isErrorOfTypes(result, [
          "CardDeclined",
          "InsufficientFunds",
          "ProcessingError",
        ])
      ) {
        console.log(
          `   💳 Payment issue: ${result.transactionId} (${result.provider})`
        );
      }
    } else {
      console.log(`   ✅ Success: ${result}`);
    }
  }

  return results;
}

function demoErrorAnalysis(results: Array<TryResult<string, OrderError>>) {
  console.log("\n\n📊 Error Analysis Demo");
  console.log("=".repeat(50));

  // Partition results
  const [successes, errors] = partitionResults(results);
  console.log(`\n📈 Results Summary:`);
  console.log(`   Successful orders: ${successes.length}`);
  console.log(`   Failed orders: ${errors.length}`);

  if (errors.length > 0) {
    // Get error summary
    const summary = getErrorSummary(errors);
    console.log(`\n📋 Error Breakdown:`);
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Create error report
    console.log(`\n📄 Detailed Error Report:`);
    console.log(createErrorReport(errors));
  }
}

function demoConvenienceFactories() {
  console.log("\n\n🛠️ Convenience Factories Demo");
  console.log("=".repeat(50));

  // Show the convenience factories for common patterns
  const entityError = createEntityError(
    "user",
    "user_123",
    "UserNotFound",
    "User not found"
  );
  const amountError = createAmountError(
    99.99,
    "USD",
    "InsufficientFunds",
    "Insufficient funds"
  );
  const externalError = createExternalError(
    "stripe",
    "RateLimited",
    "Rate limit exceeded",
    {
      statusCode: 429,
      externalId: "req_123",
    }
  );
  const validationError = createValidationError(
    "FormValidation",
    "Form validation failed",
    {
      email: ["Must be a valid email"],
      password: ["Must be at least 8 characters"],
    },
    "FORM_VALIDATION_ERROR"
  );

  console.log(
    "\n🏷️ Entity Error:",
    entityError.type,
    `(${entityError.entityType}:${entityError.entityId})`
  );
  console.log(
    "💰 Amount Error:",
    amountError.type,
    `(${amountError.currency} ${amountError.amount})`
  );
  console.log(
    "🌐 External Error:",
    externalError.type,
    `(${externalError.provider}, status: ${externalError.statusCode})`
  );
  console.log(
    "✅ Validation Error:",
    validationError.type,
    `(${validationError.code}, ${
      Object.keys(validationError.fields).length
    } fields)`
  );
}

// ============================================================================
// 6. RUN DEMO
// ============================================================================

async function runDemo() {
  console.log("🚀 Stage 2 Error Factories Demo");
  console.log(
    "This demo shows how error factories make domain-specific error handling much easier\n"
  );

  try {
    demoBasicFactories();
    const results = await demoOrderProcessing();
    demoErrorAnalysis(results);
    demoConvenienceFactories();

    console.log("\n\n✨ Demo completed successfully!");
    console.log("\nKey benefits of Stage 2 factories:");
    console.log("• Eliminate boilerplate with createErrorFactory()");
    console.log("• Consistent domain-specific error structures");
    console.log("• Rich error context with automatic source detection");
    console.log("• Type-safe error handling with discriminated unions");
    console.log("• Powerful error analysis and reporting utilities");
  } catch (error) {
    console.error("Demo failed:", error);
  }
}

// Run the demo
runDemo();
