import React from "react";
import { useTry, useTryCallback, TryErrorBoundary } from "../../src";

// Mock API functions
const fetchUser = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (userId === "error") {
    throw new Error("User not found");
  }

  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  };
};

const updateUser = async (
  userId: string,
  updates: Partial<{ name: string; email: string }>
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: userId,
    ...updates,
  };
};

// User profile component
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  // Fetch user data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useTry(() => fetchUser(userId), {
    deps: [userId],
    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });

  // Update user mutation
  const { execute: updateUserData, isLoading: isUpdating } = useTryCallback(
    async (updates: Partial<{ name: string; email: string }>) => {
      return await updateUser(userId, updates);
    },
    {
      onSuccess: (updatedUser) => {
        console.log("User updated successfully:", updatedUser);
        // Refetch to get latest data
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update user:", error);
      },
    }
  );

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data</div>;
  }

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>User Profile</h2>
      <p>
        <strong>ID:</strong> {user.id}
      </p>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => updateUserData({ name: "Updated Name" })}
          disabled={isUpdating}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            backgroundColor: isUpdating ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isUpdating ? "not-allowed" : "pointer",
          }}
        >
          {isUpdating ? "Updating..." : "Update Name"}
        </button>

        <button
          onClick={refetch}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

// App component with error boundary
export const App: React.FC = () => {
  const [userId, setUserId] = React.useState("123");

  return (
    <div style={{ padding: "20px" }}>
      <h1>@try-error/react Demo</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID (try 'error' for error demo)"
            style={{ marginLeft: "10px", padding: "4px" }}
          />
        </label>
      </div>

      <TryErrorBoundary
        fallback={({ error, retry }) => (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#ffe6e6",
              border: "1px solid #ff0000",
              borderRadius: "8px",
            }}
          >
            <h3>Something went wrong!</h3>
            <p>{error.message}</p>
            <button onClick={retry}>Try Again</button>
          </div>
        )}
        resetKeys={[userId]}
      >
        <UserProfile userId={userId} />
      </TryErrorBoundary>
    </div>
  );
};
