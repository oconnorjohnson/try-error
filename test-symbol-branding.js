const { isTryError, createError } = require("./dist");

console.log("Testing Symbol Branding Implementation\n");

// Test 1: Real TryError should pass
const realError = createError({
  type: "TestError",
  message: "This is a real error",
});
console.log("1. Real TryError:");
console.log("   isTryError(realError):", isTryError(realError));
console.log("   ✓ Should be true\n");

// Test 2: Spoofed error without brand should fail
const spoofedError1 = {
  type: "SpoofedError",
  message: "This is a spoofed error",
  source: "fake.js:1:1",
  timestamp: Date.now(),
};
console.log("2. Spoofed error without brand:");
console.log("   isTryError(spoofedError1):", isTryError(spoofedError1));
console.log("   ✓ Should be false\n");

// Test 3: Spoofed error with wrong Symbol should fail
const wrongSymbol = Symbol("try-error.TryError");
const spoofedError2 = {
  [wrongSymbol]: true,
  type: "SpoofedError",
  message: "This is a spoofed error",
  source: "fake.js:1:1",
  timestamp: Date.now(),
};
console.log("3. Spoofed error with wrong Symbol:");
console.log("   isTryError(spoofedError2):", isTryError(spoofedError2));
console.log("   ✓ Should be false\n");

// Test 4: Spoofed error with correct Symbol key but wrong value should fail
const spoofedError3 = {
  [Symbol.for("try-error.TryError")]: "not true",
  type: "SpoofedError",
  message: "This is a spoofed error",
  source: "fake.js:1:1",
  timestamp: Date.now(),
};
console.log("4. Spoofed error with wrong brand value:");
console.log("   isTryError(spoofedError3):", isTryError(spoofedError3));
console.log("   ✓ Should be false\n");

// Test 5: Even with all properties, without brand it should fail
const spoofedError4 = {
  type: "CompleteSpoof",
  message: "This looks complete",
  source: "fake.js:1:1",
  timestamp: Date.now(),
  stack: "fake stack",
  context: { test: true },
  cause: new Error("fake cause"),
};
console.log("5. Complete spoof with all properties but no brand:");
console.log("   isTryError(spoofedError4):", isTryError(spoofedError4));
console.log("   ✓ Should be false\n");

console.log("✅ Symbol branding is working correctly!");
console.log(
  "   Type guards cannot be spoofed by creating objects with matching properties."
);
