// Basic test of try-error package
console.log("🧪 Testing try-error package...\n");

try {
  const {
    trySync,
    tryAsync,
    isOk,
    isErr,
    tryMap,
    tryChain,
    tryAll,
    tryAny,
    unwrap,
    unwrapOr,
  } = require("try-error");

  console.log("✅ Package imported successfully!\n");

  // Test 1: Basic sync operation
  console.log("📝 Test 1: Basic sync operation");
  const result1 = trySync(() => {
    return "Hello from try-error!";
  });

  if (isOk(result1)) {
    console.log("✅ Success:", result1);
  } else {
    console.log("❌ Unexpected error:", result1.message);
  }
  console.log("");

  // Test 2: Error handling
  console.log("📝 Test 2: Error handling");
  const result2 = trySync(() => {
    throw new Error("Test error");
  });

  if (isErr(result2)) {
    console.log("✅ Error caught:", result2.message);
    console.log("   Type:", result2.type);
  } else {
    console.log("❌ Expected error but got success");
  }
  console.log("");

  // Test 3: Mapping successful results
  console.log("📝 Test 3: Mapping results");
  const result3 = tryMap(
    trySync(() => "hello"),
    (value) => value.toUpperCase()
  );

  if (isOk(result3)) {
    console.log("✅ Mapped result:", result3);
  } else {
    console.log("❌ Mapping failed:", result3.message);
  }
  console.log("");

  // Test 4: Chaining operations
  console.log("📝 Test 4: Chaining operations");
  const result4 = tryChain(
    trySync(() => "42"),
    (value) => trySync(() => parseInt(value) * 2)
  );

  if (isOk(result4)) {
    console.log("✅ Chained result:", result4);
  } else {
    console.log("❌ Chaining failed:", result4.message);
  }
  console.log("");

  // Test 5: Parallel operations
  console.log("📝 Test 5: Parallel operations");
  const result5 = tryAll([
    () => trySync(() => 1),
    () => trySync(() => 2),
    () => trySync(() => 3),
  ]);

  if (isOk(result5)) {
    console.log("✅ All results:", result5);
  } else {
    console.log("❌ Parallel operation failed:", result5.message);
  }
  console.log("");

  // Test 6: First success
  console.log("📝 Test 6: First success");
  const result6 = tryAny([
    () =>
      trySync(() => {
        throw new Error("First fails");
      }),
    () => trySync(() => "Second succeeds!"),
    () => trySync(() => "Third won't run"),
  ]);

  if (isOk(result6)) {
    console.log("✅ First success:", result6);
  } else {
    console.log("❌ All operations failed:", result6.message);
  }
  console.log("");

  // Test 7: Unwrapping with fallback
  console.log("📝 Test 7: Unwrapping with fallback");
  const errorResult = trySync(() => {
    throw new Error("Oops");
  });
  const fallbackValue = unwrapOr(errorResult, "fallback value");
  console.log("✅ Fallback result:", fallbackValue);
  console.log("");

  // Test 8: Async operations
  console.log("📝 Test 8: Async operations");
  tryAsync(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "Async success!";
  })
    .then((result8) => {
      if (isOk(result8)) {
        console.log("✅ Async result:", result8);
      } else {
        console.log("❌ Async failed:", result8.message);
      }
      console.log("");
      console.log("🎉 All tests completed successfully!");
    })
    .catch((err) => {
      console.log("❌ Async test failed:", err);
    });
} catch (error) {
  console.error("❌ Failed to import try-error package:");
  console.error("   Make sure to run: npm run install-local");
  console.error("   Error:", error.message);
  process.exit(1);
}
