import React, { useState, useEffect } from "react";
import {
  tryAsync,
  isTryError,
  createError,
  retry,
  withTimeout,
} from "try-error";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

// Mock API function that simulates network requests
const fetchUser = async (userId: number): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 1000 + 500)
  );

  // Simulate occasional failures
  if (Math.random() < 0.3) {
    throw new Error("Network error: Failed to fetch user");
  }

  // Simulate user not found
  if (userId === 404) {
    throw createError("USER_NOT_FOUND", `User with ID ${userId} not found`);
  }

  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    bio: `This is the bio for user ${userId}. They are a wonderful person!`,
  };
};

export function UserProfile() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async (id: number) => {
    setLoading(true);
    setError(null);

    // Use try-error with retry and timeout
    const result = await tryAsync(async () => {
      return await retry(
        () => withTimeout(fetchUser(id), 5000), // 5 second timeout
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: "exponential",
        }
      );
    });

    setLoading(false);

    if (isTryError(result)) {
      setError(result.message);
      setUser(null);
    } else {
      setUser(result);
      setError(null);
    }
  };

  const handleUserIdChange = (newId: number) => {
    setUserId(newId);
    loadUser(newId);
  };

  // Load initial user
  useEffect(() => {
    loadUser(userId);
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">User Profile Fetcher</h2>

      {/* User ID Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User ID:
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 404, 5].map((id) => (
            <button
              key={id}
              onClick={() => handleUserIdChange(id)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                userId === id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {id === 404 ? "Not Found" : `User ${id}`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading user...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={() => loadUser(userId)}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success State */}
      {user && !loading && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={`${user.name}'s avatar`}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
              <div className="mt-3 text-sm text-gray-500">
                User ID: {user.id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Example Info */}
      <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <p className="font-medium mb-2">This example demonstrates:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Async data fetching with{" "}
            <code className="bg-white px-1 rounded">tryAsync</code>
          </li>
          <li>Automatic retry with exponential backoff</li>
          <li>Request timeout handling</li>
          <li>Loading and error state management</li>
          <li>Type-safe error handling</li>
        </ul>
      </div>
    </div>
  );
}
