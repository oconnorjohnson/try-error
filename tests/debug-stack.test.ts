import { createError } from "../src/errors";

describe("Debug Stack Trace", () => {
  it("should show stack trace structure", () => {
    // Enable debug logging
    process.env.DEBUG_STACK = "true";

    const error = createError({
      type: "DebugError",
      message: "Debug stack trace",
    });

    console.log("Full error:", error);
    console.log("Error source:", error.source);

    // Create error directly to see raw stack
    const rawError = new Error("Raw error");
    console.log("Raw stack trace:", rawError.stack);

    delete process.env.DEBUG_STACK;
  });
});
