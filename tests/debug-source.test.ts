import { createError } from "../src/errors";

describe("Debug Source Location", () => {
  it("should debug source location detection", () => {
    process.env.DEBUG_STACK = "true";

    // Create error and see what happens
    const error = createError({
      type: "DebugError",
      message: "Debug message",
    });

    console.log("Error source:", error.source);
    console.log("Error stack:", error.stack);

    // Try with different stack offsets
    const error2 = createError({
      type: "DebugError2",
      message: "Debug message 2",
      stackOffset: 2,
    });
    console.log("Error2 source (offset 2):", error2.source);

    const error3 = createError({
      type: "DebugError3",
      message: "Debug message 3",
      stackOffset: 4,
    });
    console.log("Error3 source (offset 4):", error3.source);

    const error4 = createError({
      type: "DebugError4",
      message: "Debug message 4",
      stackOffset: 5,
    });
    console.log("Error4 source (offset 5):", error4.source);

    delete process.env.DEBUG_STACK;
  });
});
