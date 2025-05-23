import React, { useState } from "react";
import {
  tryAllAsync,
  tryAnyAsync,
  isTryError,
  createError,
  tryAsync,
} from "../../../../src";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// Mock API functions
const fetchPost = async (postId: number): Promise<Post> => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 800 + 200)
  );

  if (Math.random() < 0.2) {
    throw createError({
      type: "FETCH_ERROR",
      message: `Failed to fetch post ${postId}`,
    });
  }

  return {
    id: postId,
    title: `Post ${postId} Title`,
    body: `This is the content of post ${postId}. It contains interesting information.`,
    userId: Math.floor(Math.random() * 5) + 1,
  };
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 600 + 300)
  );

  if (Math.random() < 0.15) {
    throw createError({
      type: "FETCH_ERROR",
      message: `Failed to fetch comments for post ${postId}`,
    });
  }

  return Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    postId,
    name: `Commenter ${i + 1}`,
    email: `commenter${i + 1}@example.com`,
    body: `This is comment ${i + 1} on post ${postId}.`,
  }));
};

const fetchUser = async (userId: number): Promise<User> => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500 + 100)
  );

  if (Math.random() < 0.1) {
    throw createError({
      type: "FETCH_ERROR",
      message: `Failed to fetch user ${userId}`,
    });
  }

  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  };
};

export function ParallelRequests() {
  const [postId, setPostId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    post: Post;
    comments: Comment[];
    user: User;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<"all" | "any">("all");

  const loadPostData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    if (strategy === "all") {
      // Load all data in parallel - all must succeed
      const result = await tryAllAsync([
        tryAsync(() => fetchPost(postId)),
        tryAsync(() => fetchComments(postId)),
        tryAsync(() => fetchUser(Math.floor(Math.random() * 5) + 1)), // Random user
      ]);

      setLoading(false);

      if (isTryError(result)) {
        setError(`Failed to load all data: ${result.message}`);
      } else {
        const [post, comments, user] = result as [Post, Comment[], User];
        setData({ post, comments, user });
      }
    } else {
      // Try multiple sources - first success wins
      const result = await tryAnyAsync([
        tryAsync(() => fetchPost(postId)),
        tryAsync(() => fetchPost(postId + 1)), // Fallback post
        tryAsync(() => fetchPost(postId + 2)), // Another fallback
      ]);

      setLoading(false);

      if (isTryError(result)) {
        setError(`All post fetch attempts failed: ${result.message}`);
      } else {
        // For 'any' strategy, we just show the post that succeeded
        setData({
          post: result,
          comments: [],
          user: { id: 0, name: "Unknown", email: "unknown@example.com" },
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Parallel Data Fetching</h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post ID:
          </label>
          <input
            type="number"
            value={postId}
            onChange={(e) => setPostId(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategy:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={strategy === "all"}
                onChange={(e) => setStrategy(e.target.value as "all" | "any")}
                className="mr-2"
              />
              <span>All (tryAllAsync) - All requests must succeed</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="any"
                checked={strategy === "any"}
                onChange={(e) => setStrategy(e.target.value as "all" | "any")}
                className="mr-2"
              />
              <span>Any (tryAnyAsync) - First success wins</span>
            </label>
          </div>
        </div>

        <button
          onClick={loadPostData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Data"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">
            Loading data using{" "}
            {strategy === "all" ? "tryAllAsync" : "tryAnyAsync"}...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <button
            onClick={loadPostData}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success State */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Post */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{data.post.title}</h3>
            <p className="text-gray-700">{data.post.body}</p>
            <div className="mt-2 text-sm text-gray-500">
              Post ID: {data.post.id} | User ID: {data.post.userId}
            </div>
          </div>

          {/* User (only for 'all' strategy) */}
          {strategy === "all" && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold">Author</h4>
              <p>
                {data.user.name} ({data.user.email})
              </p>
            </div>
          )}

          {/* Comments (only for 'all' strategy) */}
          {strategy === "all" && data.comments.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Comments</h4>
              <div className="space-y-2">
                {data.comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">{comment.name}</div>
                    <div className="text-gray-700">{comment.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example Info */}
      <div className="mt-6 text-sm text-gray-600 bg-yellow-50 p-4 rounded">
        <p className="font-medium mb-2">This example demonstrates:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code className="bg-white px-1 rounded">tryAllAsync</code> - All
            operations must succeed
          </li>
          <li>
            <code className="bg-white px-1 rounded">tryAnyAsync</code> - First
            successful operation wins
          </li>
          <li>Parallel execution for better performance</li>
          <li>Different strategies for different use cases</li>
          <li>Graceful handling of partial failures</li>
        </ul>
      </div>
    </div>
  );
}
