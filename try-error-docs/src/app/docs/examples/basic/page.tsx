export default function BasicExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Basic Examples
        </h1>
        <p className="text-xl text-slate-600">
          Common patterns and real-world examples using try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* JSON Parsing */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            JSON Parsing
          </h2>

          <p className="text-slate-600 mb-4">
            One of the most common use cases for try-error is safe JSON parsing:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { trySync, isTryError } from 'try-error';

function parseUserConfig(jsonString: string) {
  const result = trySync(() => JSON.parse(jsonString));
  
  if (isTryError(result)) {
    console.error('Invalid JSON configuration:', result.message);
    return {
      theme: 'light',
      language: 'en',
      notifications: true
    }; // Return default config
  }
  
  return result;
}

// Usage
const configJson = '{"theme": "dark", "language": "es"}';
const config = parseUserConfig(configJson);
console.log(config.theme); // "dark"

const invalidJson = '{"theme": "dark", "language":}'; // Invalid JSON
const fallbackConfig = parseUserConfig(invalidJson);
console.log(fallbackConfig.theme); // "light" (default)`}</code>
            </pre>
          </div>
        </section>

        {/* API Calls */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            API Calls
          </h2>

          <p className="text-slate-600 mb-4">
            Handle network requests with proper error handling:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { tryAsync, isTryError } from 'try-error';

async function fetchUserProfile(userId: string) {
  // Fetch user data
  const userResponse = await tryAsync(() => 
    fetch(\`/api/users/\${userId}\`)
  );
  
  if (isTryError(userResponse)) {
    return {
      error: 'Network error',
      message: userResponse.message,
      user: null
    };
  }
  
  // Check if response is ok
  if (!userResponse.ok) {
    return {
      error: 'API error',
      message: \`HTTP \${userResponse.status}: \${userResponse.statusText}\`,
      user: null
    };
  }
  
  // Parse JSON response
  const userData = await tryAsync(() => userResponse.json());
  
  if (isTryError(userData)) {
    return {
      error: 'Parse error',
      message: 'Invalid JSON response',
      user: null
    };
  }
  
  return {
    error: null,
    message: 'Success',
    user: userData
  };
}

// Usage
const profile = await fetchUserProfile('123');
if (profile.error) {
  console.error(\`Failed to load profile: \${profile.message}\`);
} else {
  console.log('User loaded:', profile.user.name);
}`}</code>
            </pre>
          </div>
        </section>

        {/* File Operations */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            File Operations (Node.js)
          </h2>

          <p className="text-slate-600 mb-4">
            Safe file reading and writing operations:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { trySync, tryAsync, isTryError } from 'try-error';
import fs from 'fs';

// Synchronous file reading
function readConfigFile(path: string) {
  const result = trySync(() => fs.readFileSync(path, 'utf8'));
  
  if (isTryError(result)) {
    console.error(\`Failed to read config file: \${result.message}\`);
    return null;
  }
  
  // Parse the JSON content
  const parseResult = trySync(() => JSON.parse(result));
  
  if (isTryError(parseResult)) {
    console.error(\`Invalid JSON in config file: \${parseResult.message}\`);
    return null;
  }
  
  return parseResult;
}

// Asynchronous file operations
async function saveUserData(userId: string, data: any) {
  const jsonString = JSON.stringify(data, null, 2);
  const filePath = \`./data/users/\${userId}.json\`;
  
  const result = await tryAsync(() => 
    fs.promises.writeFile(filePath, jsonString, 'utf8')
  );
  
  if (isTryError(result)) {
    console.error(\`Failed to save user data: \${result.message}\`);
    return false;
  }
  
  console.log(\`User data saved to \${filePath}\`);
  return true;
}

// Usage
const config = readConfigFile('./config.json');
if (config) {
  console.log('Config loaded:', config);
}

const saved = await saveUserData('123', { name: 'John', age: 30 });
if (!saved) {
  console.error('Failed to save user data');
}`}</code>
            </pre>
          </div>
        </section>

        {/* Form Validation */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Form Validation
          </h2>

          <p className="text-slate-600 mb-4">
            Validate user input with detailed error reporting:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { trySync, isTryError } from 'try-error';

interface UserForm {
  email: string;
  age: string;
  password: string;
}

function validateEmail(email: string) {
  const result = trySync(() => {
    if (!email) throw new Error('Email is required');
    if (!email.includes('@')) throw new Error('Invalid email format');
    if (email.length < 5) throw new Error('Email too short');
    return email.toLowerCase();
  });
  return result;
}

function validateAge(ageString: string) {
  const result = trySync(() => {
    if (!ageString) throw new Error('Age is required');
    const age = parseInt(ageString, 10);
    if (isNaN(age)) throw new Error('Age must be a number');
    if (age < 13) throw new Error('Must be at least 13 years old');
    if (age > 120) throw new Error('Invalid age');
    return age;
  });
  return result;
}

function validatePassword(password: string) {
  const result = trySync(() => {
    if (!password) throw new Error('Password is required');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) throw new Error('Password must contain uppercase letter');
    if (!/[0-9]/.test(password)) throw new Error('Password must contain a number');
    return password;
  });
  return result;
}

function validateUserForm(form: UserForm) {
  const errors: string[] = [];
  const validatedData: any = {};
  
  // Validate email
  const emailResult = validateEmail(form.email);
  if (isTryError(emailResult)) {
    errors.push(\`Email: \${emailResult.message}\`);
  } else {
    validatedData.email = emailResult;
  }
  
  // Validate age
  const ageResult = validateAge(form.age);
  if (isTryError(ageResult)) {
    errors.push(\`Age: \${ageResult.message}\`);
  } else {
    validatedData.age = ageResult;
  }
  
  // Validate password
  const passwordResult = validatePassword(form.password);
  if (isTryError(passwordResult)) {
    errors.push(\`Password: \${passwordResult.message}\`);
  } else {
    validatedData.password = passwordResult;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: validatedData
  };
}

// Usage
const formData = {
  email: 'user@example.com',
  age: '25',
  password: 'SecurePass123'
};

const validation = validateUserForm(formData);
if (validation.valid) {
  console.log('Form is valid:', validation.data);
} else {
  console.error('Validation errors:', validation.errors);
}`}</code>
            </pre>
          </div>
        </section>

        {/* Database Operations */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Database Operations
          </h2>

          <p className="text-slate-600 mb-4">
            Handle database operations with proper error handling:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { tryAsync, isTryError } from 'try-error';

class UserRepository {
  constructor(private db: any) {}
  
  async createUser(userData: any) {
    const result = await tryAsync(() => 
      this.db.users.create(userData)
    );
    
    if (isTryError(result)) {
      console.error('Failed to create user:', result.message);
      return { success: false, error: result.message };
    }
    
    return { success: true, user: result };
  }
  
  async findUserById(id: string) {
    const result = await tryAsync(() => 
      this.db.users.findById(id)
    );
    
    if (isTryError(result)) {
      console.error('Failed to find user:', result.message);
      return null;
    }
    
    return result;
  }
  
  async updateUser(id: string, updates: any) {
    const result = await tryAsync(() => 
      this.db.users.update(id, updates)
    );
    
    if (isTryError(result)) {
      console.error('Failed to update user:', result.message);
      return { success: false, error: result.message };
    }
    
    return { success: true, user: result };
  }
  
  async deleteUser(id: string) {
    const result = await tryAsync(() => 
      this.db.users.delete(id)
    );
    
    if (isTryError(result)) {
      console.error('Failed to delete user:', result.message);
      return { success: false, error: result.message };
    }
    
    return { success: true };
  }
}

// Usage
const userRepo = new UserRepository(database);

// Create user
const createResult = await userRepo.createUser({
  name: 'John Doe',
  email: 'john@example.com'
});

if (createResult.success) {
  console.log('User created:', createResult.user);
} else {
  console.error('Failed to create user:', createResult.error);
}

// Find user
const user = await userRepo.findUserById('123');
if (user) {
  console.log('User found:', user.name);
} else {
  console.log('User not found');
}`}</code>
            </pre>
          </div>
        </section>

        {/* Configuration Loading */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration Loading
          </h2>

          <p className="text-slate-600 mb-4">
            Load and validate application configuration with fallbacks:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { trySync, isTryError } from 'try-error';

interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    name: string;
  };
  features: {
    enableLogging: boolean;
    enableMetrics: boolean;
  };
}

const defaultConfig: AppConfig = {
  port: 3000,
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp'
  },
  features: {
    enableLogging: true,
    enableMetrics: false
  }
};

function loadConfig(): AppConfig {
  // Try to load from environment variables
  const envResult = trySync(() => {
    const port = process.env.PORT;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    
    if (!port || !dbHost || !dbPort) {
      throw new Error('Missing required environment variables');
    }
    
    return {
      port: parseInt(port, 10),
      database: {
        host: dbHost,
        port: parseInt(dbPort, 10),
        name: process.env.DB_NAME || defaultConfig.database.name
      },
      features: {
        enableLogging: process.env.ENABLE_LOGGING === 'true',
        enableMetrics: process.env.ENABLE_METRICS === 'true'
      }
    };
  });
  
  if (!isTryError(envResult)) {
    console.log('Configuration loaded from environment variables');
    return envResult;
  }
  
  // Try to load from config file
  const fileResult = trySync(() => {
    const fs = require('fs');
    const configFile = fs.readFileSync('./config.json', 'utf8');
    return JSON.parse(configFile);
  });
  
  if (!isTryError(fileResult)) {
    console.log('Configuration loaded from config.json');
    return { ...defaultConfig, ...fileResult };
  }
  
  // Fall back to default configuration
  console.warn('Using default configuration');
  return defaultConfig;
}

// Usage
const config = loadConfig();
console.log(\`Server will run on port \${config.port}\`);
console.log(\`Database: \${config.database.host}:\${config.database.port}\`);`}</code>
            </pre>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Real-World Examples
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                More complex scenarios and patterns
              </p>
              <a
                href="/docs/examples/real-world"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Advanced Examples →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                API Reference
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Complete documentation of all functions
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Browse API Docs →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Custom Errors
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn to create custom error types
              </p>
              <a
                href="/docs/advanced/custom-errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn Custom Errors →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
