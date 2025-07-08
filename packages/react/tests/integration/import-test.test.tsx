import { emitErrorCreated, createError } from "try-error";

describe("Import Test", () => {
  it("should be able to import and call emitErrorCreated", () => {
    expect(typeof emitErrorCreated).toBe("function");

    const error = createError({
      type: "TestError",
      message: "Test message",
    });

    // This should not throw
    expect(() => emitErrorCreated(error)).not.toThrow();
  });
});
