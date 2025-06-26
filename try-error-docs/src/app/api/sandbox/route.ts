import { NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

// Store active sandboxes in memory (in production, use a database)
const activeSandboxes = new Map<string, { sandbox: Sandbox; code: string }>();

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Create a unique ID for this sandbox session
    const sandboxId = Math.random().toString(36).substring(7);

    // Create the sandbox using a minimal git repo as base
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sandboxConfig: any = {
      source: {
        type: "git" as const,
        url: "https://github.com/vercel/sandbox-example-node.git",
      },
      resources: { vcpus: 2 }, // Use 2 vCPUs for playground
      timeout: ms("2m"), // 2 minute timeout for playground sessions
      runtime: "node22",
    };

    // Add authentication if available
    if (
      process.env.VERCEL_TEAM_ID &&
      process.env.VERCEL_PROJECT_ID &&
      process.env.VERCEL_TOKEN
    ) {
      sandboxConfig.teamId = process.env.VERCEL_TEAM_ID;
      sandboxConfig.projectId = process.env.VERCEL_PROJECT_ID;
      sandboxConfig.token = process.env.VERCEL_TOKEN;
    }
    // Otherwise, the SDK will use VERCEL_OIDC_TOKEN if available

    const sandbox = await Sandbox.create(sandboxConfig);

    // Store the sandbox with code
    activeSandboxes.set(sandboxId, { sandbox, code });

    // Setup the playground environment
    console.log("Setting up playground environment...");

    // Create package.json with try-error dependency
    await sandbox.writeFiles([
      {
        path: "package.json",
        content: Buffer.from(
          JSON.stringify(
            {
              name: "try-error-playground",
              version: "1.0.0",
              type: "module",
              dependencies: {
                "try-error": "latest",
                tsx: "latest",
              },
            },
            null,
            2
          )
        ),
      },
      {
        path: "tsconfig.json",
        content: Buffer.from(
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2022",
                module: "ESNext",
                moduleResolution: "node",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
              },
            },
            null,
            2
          )
        ),
      },
      {
        path: "index.ts",
        content: Buffer.from(code),
      },
    ]);

    // Install dependencies
    const install = await sandbox.runCommand({
      cmd: "npm",
      args: ["install", "--loglevel", "error"],
    });

    if (install.exitCode !== 0) {
      throw new Error("Failed to install dependencies: " + install.stderr);
    }

    return NextResponse.json({
      sandboxId,
      url: sandbox.domain(3000), // Return the sandbox URL
    });
  } catch (error) {
    console.error("Sandbox creation error:", error);
    return NextResponse.json(
      { error: "Failed to create sandbox" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get("id");

    if (!sandboxId) {
      return NextResponse.json(
        { error: "Sandbox ID required" },
        { status: 400 }
      );
    }

    const entry = activeSandboxes.get(sandboxId);
    if (entry) {
      await entry.sandbox.stop();
      activeSandboxes.delete(sandboxId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sandbox deletion error:", error);
    return NextResponse.json(
      { error: "Failed to stop sandbox" },
      { status: 500 }
    );
  }
}

// Run code in an existing sandbox
export async function PUT(request: NextRequest) {
  try {
    const { sandboxId, code } = await request.json();

    const entry = activeSandboxes.get(sandboxId);
    if (!entry) {
      return NextResponse.json({ error: "Sandbox not found" }, { status: 404 });
    }

    // Update the code file
    await entry.sandbox.writeFiles([
      {
        path: "index.ts",
        content: Buffer.from(code),
      },
    ]);

    // Run the code with proper Node.js module support
    const result = await entry.sandbox.runCommand({
      cmd: "node",
      args: ["--loader", "tsx", "index.ts"],
    });

    return NextResponse.json({
      output: result.stdout || "",
      error: result.stderr || "",
      exitCode: result.exitCode,
    });
  } catch (error) {
    console.error("Sandbox execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
