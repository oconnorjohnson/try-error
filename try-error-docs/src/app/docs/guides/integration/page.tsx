export default function IntegrationGuidesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Integration Guides
        </h1>
        <p className="text-xl text-slate-600">
          Learn how to integrate try-error with popular frameworks, libraries,
          and tools
        </p>
      </div>

      <div className="space-y-8">
        {/* Express.js Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Express.js Integration
          </h2>

          <p className="text-slate-600 mb-4">
            Integrate try-error with Express.js for consistent error handling
            across your API routes.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import express from 'express';
import { tryAsync, isTryError } from 'try-error';

const app = express();

// Error handling middleware
const handleTryError = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  return async (handler: (req: express.Request, res: express.Response) => Promise<any>) => {
    const result = await tryAsync(() => handler(req, res));
    
    if (isTryError(result)) {
      console.error('Route error:', result);
      
      // Map error types to HTTP status codes
      const statusCode = getStatusCodeFromError(result);
      
      res.status(statusCode).json({
        error: {
          message: result.message,
          type: result.type,
          ...(process.env.NODE_ENV === 'development' && {
            stack: result.stack,
            context: result.context
          })
        }
      });
    }
  };
};

function getStatusCodeFromError(error: TryError): number {
  switch (error.type) {
    case 'ValidationError': return 400;
    case 'AuthenticationError': return 401;
    case 'AuthorizationError': return 403;
    case 'NotFoundError': return 404;
    case 'ConflictError': return 409;
    case 'RateLimitError': return 429;
    default: return 500;
  }
}

// Usage in routes
app.get('/users/:id', handleTryError(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const user = await fetchUser(userId);
  res.json(user);
}));

app.post('/users', handleTryError(async (req, res) => {
  const userData = req.body;
  
  // Validation
  const validationResult = validateUserData(userData);
  if (isTryError(validationResult)) {
    throw validationResult;
  }
  
  const newUser = await createUser(userData);
  res.status(201).json(newUser);
}));`}</code>
            </pre>
          </div>
        </section>

        {/* Next.js Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next.js Integration
          </h2>

          <p className="text-slate-600 mb-4">
            Use try-error in Next.js API routes and server components for robust
            error handling.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                API Routes
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { tryAsync, isTryError } from 'try-error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await tryAsync(async () => {
    const { id } = req.query;
    
    if (typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    return await fetchUser(id);
  });

  if (isTryError(result)) {
    console.error('API Error:', result);
    
    const statusCode = result.message.includes('Invalid') ? 400 : 500;
    return res.status(statusCode).json({
      error: result.message,
      ...(process.env.NODE_ENV === 'development' && {
        details: result.context
      })
    });
  }

  res.json(result);
}`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                App Router (Next.js 13+)
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tryAsync, isTryError } from 'try-error';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await tryAsync(async () => {
    const user = await fetchUser(params.id);
    return user;
  });

  if (isTryError(result)) {
    return NextResponse.json(
      { error: result.message },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}

// Server Component
export default async function UserPage({ params }: { params: { id: string } }) {
  const result = await tryAsync(() => fetchUser(params.id));
  
  if (isTryError(result)) {
    return (
      <div className="error-container">
        <h1>Error Loading User</h1>
        <p>{result.message}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>{result.name}</h1>
      <p>{result.email}</p>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Prisma Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Prisma Integration
          </h2>

          <p className="text-slate-600 mb-4">
            Wrap Prisma operations with try-error for consistent database error
            handling.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { PrismaClient, Prisma } from '@prisma/client';
import { tryAsync, isTryError, createTryError } from 'try-error';

const prisma = new PrismaClient();

// Database service with try-error
export class UserService {
  static async findById(id: string) {
    return tryAsync(async () => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { posts: true }
      });
      
      if (!user) {
        throw createTryError('NotFoundError', \`User with id \${id} not found\`, {
          userId: id
        });
      }
      
      return user;
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    return tryAsync(async () => {
      try {
        return await prisma.user.create({ data });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw createTryError('ConflictError', 'User already exists', {
              field: error.meta?.target,
              originalError: error
            });
          }
        }
        throw error;
      }
    });
  }

  static async update(id: string, data: Prisma.UserUpdateInput) {
    return tryAsync(async () => {
      try {
        return await prisma.user.update({
          where: { id },
          data
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw createTryError('NotFoundError', \`User with id \${id} not found\`, {
              userId: id
            });
          }
        }
        throw error;
      }
    });
  }

  static async delete(id: string) {
    return tryAsync(async () => {
      try {
        await prisma.user.delete({ where: { id } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw createTryError('NotFoundError', \`User with id \${id} not found\`, {
              userId: id
            });
          }
        }
        throw error;
      }
    });
  }
}

// Usage
async function handleUserRequest(userId: string) {
  const userResult = await UserService.findById(userId);
  
  if (isTryError(userResult)) {
    if (userResult.type === 'NotFoundError') {
      return { status: 404, error: 'User not found' };
    }
    return { status: 500, error: 'Database error' };
  }
  
  return { status: 200, data: userResult };
}`}</code>
            </pre>
          </div>
        </section>

        {/* Zod Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Zod Integration
          </h2>

          <p className="text-slate-600 mb-4">
            Combine try-error with Zod for robust input validation and error
            handling.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { z } from 'zod';
import { trySync, isTryError, createTryError } from 'try-error';

// Schema definitions
const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18 years old').optional(),
});

const CreateUserSchema = UserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Validation helper
function validateWithTryError<T>(schema: z.ZodSchema<T>, data: unknown) {
  return trySync(() => {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      throw createTryError('ValidationError', 'Validation failed', {
        validationErrors: errors,
        invalidData: data
      });
    }
    
    return result.data;
  });
}

// Usage in API routes
export async function createUser(userData: unknown) {
  // Validate input
  const validationResult = validateWithTryError(CreateUserSchema, userData);
  
  if (isTryError(validationResult)) {
    return validationResult; // Return validation error
  }
  
  // Proceed with validated data
  const result = await tryAsync(async () => {
    const hashedPassword = await hashPassword(validationResult.password);
    
    return await UserService.create({
      name: validationResult.name,
      email: validationResult.email,
      age: validationResult.age,
      password: hashedPassword
    });
  });
  
  return result;
}

// Express middleware for validation
function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const validationResult = validateWithTryError(schema, req.body);
    
    if (isTryError(validationResult)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.context?.validationErrors
      });
    }
    
    req.body = validationResult; // Replace with validated data
    next();
  };
}

// Usage
app.post('/users', validateBody(CreateUserSchema), async (req, res) => {
  // req.body is now typed and validated
  const result = await createUser(req.body);
  
  if (isTryError(result)) {
    return res.status(500).json({ error: result.message });
  }
  
  res.status(201).json(result);
});`}</code>
            </pre>
          </div>
        </section>

        {/* Jest Testing Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Jest Testing Integration
          </h2>

          <p className="text-slate-600 mb-4">
            Test your try-error implementations effectively with Jest custom
            matchers and utilities.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Custom Jest Matchers
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// jest-setup.ts
import { isTryError } from 'try-error';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTryError(): R;
      toBeTrySuccess(): R;
      toHaveErrorType(type: string): R;
      toHaveErrorMessage(message: string | RegExp): R;
    }
  }
}

expect.extend({
  toBeTryError(received) {
    const pass = isTryError(received);
    
    if (pass) {
      return {
        message: () => \`expected \${received} not to be a TryError\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected \${received} to be a TryError\`,
        pass: false,
      };
    }
  },

  toBeTrySuccess(received) {
    const pass = !isTryError(received);
    
    if (pass) {
      return {
        message: () => \`expected \${received} not to be a successful result\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected \${received} to be a successful result\`,
        pass: false,
      };
    }
  },

  toHaveErrorType(received, expectedType) {
    if (!isTryError(received)) {
      return {
        message: () => \`expected \${received} to be a TryError\`,
        pass: false,
      };
    }
    
    const pass = received.type === expectedType;
    
    if (pass) {
      return {
        message: () => \`expected error type not to be \${expectedType}\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected error type \${received.type} to be \${expectedType}\`,
        pass: false,
      };
    }
  },

  toHaveErrorMessage(received, expectedMessage) {
    if (!isTryError(received)) {
      return {
        message: () => \`expected \${received} to be a TryError\`,
        pass: false,
      };
    }
    
    const pass = typeof expectedMessage === 'string' 
      ? received.message === expectedMessage
      : expectedMessage.test(received.message);
    
    if (pass) {
      return {
        message: () => \`expected error message not to match \${expectedMessage}\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected error message "\${received.message}" to match \${expectedMessage}\`,
        pass: false,
      };
    }
  },
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Test Examples
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// user.test.ts
import { UserService } from './user-service';

describe('UserService', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      const result = await UserService.findById('existing-id');
      
      expect(result).toBeTrySuccess();
      expect(result).toEqual(expect.objectContaining({
        id: 'existing-id',
        name: expect.any(String),
        email: expect.any(String)
      }));
    });

    it('should return NotFoundError when user does not exist', async () => {
      const result = await UserService.findById('non-existent-id');
      
      expect(result).toBeTryError();
      expect(result).toHaveErrorType('NotFoundError');
      expect(result).toHaveErrorMessage(/User with id .* not found/);
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const result = await UserService.create(userData);
      
      expect(result).toBeTrySuccess();
      expect(result).toEqual(expect.objectContaining(userData));
    });

    it('should return ConflictError for duplicate email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'existing@example.com'
      };
      
      const result = await UserService.create(userData);
      
      expect(result).toBeTryError();
      expect(result).toHaveErrorType('ConflictError');
      expect(result).toHaveErrorMessage('User already exists');
    });
  });
});

// Testing validation
describe('User validation', () => {
  it('should validate user data successfully', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };
    
    const result = validateWithTryError(UserSchema, validData);
    
    expect(result).toBeTrySuccess();
    expect(result).toEqual(validData);
  });

  it('should return validation error for invalid data', () => {
    const invalidData = {
      name: 'J', // Too short
      email: 'invalid-email',
      age: 15 // Too young
    };
    
    const result = validateWithTryError(UserSchema, invalidData);
    
    expect(result).toBeTryError();
    expect(result).toHaveErrorType('ValidationError');
    expect(result.context?.validationErrors).toHaveLength(3);
  });
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* TypeScript Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TypeScript Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Optimize your TypeScript configuration for the best try-error
            experience.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    // For better error handling
    "useUnknownInCatchVariables": true,
    
    // Module resolution
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    // Path mapping for cleaner imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "jest-setup.ts"
  ]
}`}</code>
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Key Configuration Benefits
            </h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>
                • <code>strict: true</code> - Enables all strict type checking
              </li>
              <li>
                • <code>exactOptionalPropertyTypes: true</code> - Better
                optional property handling
              </li>
              <li>
                • <code>noUncheckedIndexedAccess: true</code> - Safer
                array/object access
              </li>
              <li>
                • <code>useUnknownInCatchVariables: true</code> - Safer error
                handling in catch blocks
              </li>
            </ul>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Migration Guides
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Step-by-step migration from other error handling approaches
              </p>
              <a
                href="/docs/guides/migration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Migration Guides →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Best Practices
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn recommended patterns and performance tips
              </p>
              <a
                href="/docs/advanced/performance"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Best Practices →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                React Integration
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Specific guidance for React applications
              </p>
              <a
                href="/docs/react/installation"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View React Guide →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
