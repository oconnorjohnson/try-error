// Example: Async-only application with modular imports
// This reduces bundle size by ~50% compared to the full import

import {
  tryAsync,
  tryAwait,
  isTryError,
  withTimeout,
  retry,
} from "try-error/async";

// Example 1: Basic async operation
async function fetchUserData(userId: string) {
  const result = await tryAsync(async () => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  });

  if (isTryError(result)) {
    console.error("Failed to fetch user:", result.message);
    return null;
  }

  return result;
}

// Example 2: Using tryAwait with existing promises
async function processMultipleRequests(urls: string[]) {
  const promises = urls.map((url) => fetch(url));
  const results: Response[] = [];

  for (const promise of promises) {
    const result = await tryAwait(promise);
    if (isTryError(result)) {
      console.error("Request failed:", result.message);
      continue;
    }
    results.push(result);
  }

  return results;
}

// Example 3: With timeout support
async function fetchWithTimeout(url: string, timeoutMs: number = 5000) {
  const result = await withTimeout(
    tryAsync(async () => {
      const response = await fetch(url);
      return response.json();
    }),
    timeoutMs,
    `Request to ${url} timed out after ${timeoutMs}ms`
  );

  return result;
}

// Example 4: With retry support
async function reliableFetch(url: string) {
  const result = await retry(
    () =>
      tryAsync(async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      }),
    {
      attempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      shouldRetry: (error, attempt) => {
        // Retry on network errors or 5xx status codes
        const message = error.message || "";
        return message.includes("HTTP 5") || message.includes("network");
      },
    }
  );

  if (isTryError(result)) {
    console.error("Failed after retries:", result);
    return null;
  }

  return result;
}

// Example 5: Combining multiple async operations
async function createUserWithProfile(userData: any, profileData: any) {
  // Create user
  const userResult = await tryAsync(async () => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  });

  if (isTryError(userResult)) {
    return { error: "Failed to create user", details: userResult };
  }

  // Create profile
  const profileResult = await tryAsync(async () => {
    const response = await fetch(`/api/users/${userResult.id}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    return response.json();
  });

  if (isTryError(profileResult)) {
    // Rollback user creation
    await tryAsync(() =>
      fetch(`/api/users/${userResult.id}`, { method: "DELETE" })
    );
    return { error: "Failed to create profile", details: profileResult };
  }

  return { user: userResult, profile: profileResult };
}

// Usage
async function main() {
  const user = await fetchUserData("123");
  const data = await fetchWithTimeout("https://api.example.com/data", 3000);
  const reliable = await reliableFetch("https://api.example.com/important");

  console.log({ user, data, reliable });
}

main().catch(console.error);
