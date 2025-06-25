import { createError } from "../src/errors";

describe("Debug Source Location", () => {
  it("should show stack trace structure", () => {
    const error = new Error("Test");
    console.log("Stack trace:");
    console.log(error.stack);

    const tryError = createError({
      type: "TestError",
      message: "Test message",
    });

    console.log("\nTryError source:", tryError.source);
    console.log("\nTryError stack:", tryError.stack);
  });
});
