import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function RealWorldExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Real-World Examples
        </h1>
        <p className="text-xl text-slate-600">
          Complex scenarios and production-ready patterns using try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* E-commerce API */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            E-commerce Order Processing
          </h2>

          <p className="text-slate-600 mb-4">
            A complete order processing system demonstrating error handling across multiple services,
            payment processing, inventory management, and notification systems.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Service</h3>
              <CodeBlock
                language="typescript"
                title="Order Processing Pipeline"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTryError, createTryError, flatMapResult } from 'try-error';

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

class OrderService {
  async processOrder(orderData: Partial<Order>): Promise<TryResult<Order, TryError>> {
    // Validate order data
    const validationResult = await this.validateOrder(orderData);
    if (isTryError(validationResult)) {
      return validationResult;
    }

    // Check inventory availability
    const inventoryResult = await flatMapResult(validationResult, order =>
      this.checkInventory(order.items)
    );
    if (isTryError(inventoryResult)) {
      return inventoryResult;
    }

    // Calculate pricing and taxes
    const pricingResult = await flatMapResult(inventoryResult, order =>
      this.calculatePricing(order)
    );
    if (isTryError(pricingResult)) {
      return pricingResult;
    }

    // Process payment
    const paymentResult = await flatMapResult(pricingResult, order =>
      this.processPayment(order)
    );
    if (isTryError(paymentResult)) {
      // Rollback inventory reservation
      await this.releaseInventory(inventoryResult.items);
      return paymentResult;
    }

    // Reserve inventory
    const reservationResult = await flatMapResult(paymentResult, order =>
      this.reserveInventory(order.items)
    );
    if (isTryError(reservationResult)) {
      // Rollback payment
      await this.refundPayment(paymentResult.paymentId);
      return reservationResult;
    }

    // Create order record
    const orderResult = await flatMapResult(reservationResult, order =>
      this.createOrderRecord(order)
    );
    if (isTryError(orderResult)) {
      // Rollback everything
      await this.releaseInventory(reservationResult.items);
      await this.refundPayment(paymentResult.paymentId);
      return orderResult;
    }

    // Send confirmation notifications
    await this.sendOrderConfirmation(orderResult);

    return orderResult;
  }

  private async validateOrder(orderData: Partial<Order>): Promise<TryResult<Order, TryError>> {
    return tryAsync(async () => {
      if (!orderData.userId) {
        throw createTryError('ValidationError', 'User ID is required', {
          field: 'userId',
          value: orderData.userId
        });
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw createTryError('ValidationError', 'Order must contain at least one item', {
          field: 'items',
          value: orderData.items
        });
      }

      // Validate each item
      for (const item of orderData.items) {
        if (item.quantity <= 0) {
          throw createTryError('ValidationError', 'Item quantity must be positive', {
            field: 'quantity',
            productId: item.productId,
            value: item.quantity
          });
        }
      }

      return {
        id: generateOrderId(),
        userId: orderData.userId,
        items: orderData.items,
        total: 0, // Will be calculated later
        status: 'pending'
      } as Order;
    });
  }

  private async checkInventory(items: OrderItem[]): Promise<TryResult<Order, TryError>> {
    return tryAsync(async () => {
      for (const item of items) {
        const availability = await this.inventoryService.checkAvailability(item.productId);
        
        if (availability < item.quantity) {
          throw createTryError('InventoryError', 'Insufficient inventory', {
            productId: item.productId,
            requested: item.quantity,
            available: availability
          });
        }
      }

      return { items } as Order;
    });
  }

  private async processPayment(order: Order): Promise<TryResult<Order & { paymentId: string }, TryError>> {
    return tryAsync(async () => {
      const paymentResult = await this.paymentService.processPayment({
        amount: order.total,
        currency: 'USD',
        userId: order.userId,
        orderId: order.id
      });

      if (!paymentResult.success) {
        throw createTryError('PaymentError', 'Payment processing failed', {
          orderId: order.id,
          amount: order.total,
          reason: paymentResult.error,
          retryable: paymentResult.retryable
        });
      }

      return {
        ...order,
        paymentId: paymentResult.transactionId
      };
    });
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Error Recovery & Rollback</h3>
              <CodeBlock
                language="typescript"
                title="Comprehensive Error Recovery"
                showLineNumbers={true}
                className="mb-4"
              >
                {`class OrderService {
  async processOrderWithRecovery(orderData: Partial<Order>): Promise<TryResult<Order, TryError>> {
    const rollbackActions: (() => Promise<void>)[] = [];

    try {
      // Step 1: Validate order
      const validationResult = await this.validateOrder(orderData);
      if (isTryError(validationResult)) {
        return validationResult;
      }

      // Step 2: Reserve inventory
      const inventoryResult = await this.reserveInventory(validationResult.items);
      if (isTryError(inventoryResult)) {
        return inventoryResult;
      }
      rollbackActions.push(() => this.releaseInventory(validationResult.items));

      // Step 3: Process payment
      const paymentResult = await this.processPayment(validationResult);
      if (isTryError(paymentResult)) {
        await this.executeRollback(rollbackActions);
        return paymentResult;
      }
      rollbackActions.push(() => this.refundPayment(paymentResult.paymentId));

      // Step 4: Create order
      const orderResult = await this.createOrderRecord({
        ...validationResult,
        paymentId: paymentResult.paymentId
      });
      if (isTryError(orderResult)) {
        await this.executeRollback(rollbackActions);
        return orderResult;
      }

      // Step 5: Send notifications (non-critical)
      const notificationResult = await this.sendOrderConfirmation(orderResult);
      if (isTryError(notificationResult)) {
        // Log but don't fail the order
        console.warn('Failed to send order confirmation:', notificationResult.message);
      }

      return orderResult;

    } catch (error) {
      await this.executeRollback(rollbackActions);
      return createTryError('OrderProcessingError', 'Unexpected error during order processing', {
        originalError: error,
        rollbackExecuted: true
      });
    }
  }

  private async executeRollback(actions: (() => Promise<void>)[]): Promise<void> {
    // Execute rollback actions in reverse order
    for (const action of actions.reverse()) {
      try {
        await action();
      } catch (rollbackError) {
        console.error('Rollback action failed:', rollbackError);
        // Continue with other rollback actions
      }
    }
  }

  // Retry with exponential backoff for transient failures
  async processOrderWithRetry(orderData: Partial<Order>, maxAttempts = 3): Promise<TryResult<Order, TryError>> {
    let lastError: TryError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.processOrderWithRecovery(orderData);

      if (!isTryError(result)) {
        return result;
      }

      lastError = result;

      // Don't retry validation errors or payment failures
      if (hasErrorType(result, 'ValidationError') || 
          hasErrorType(result, 'PaymentError')) {
        break;
      }

      // Only retry on network errors or temporary failures
      if (hasErrorType(result, 'NetworkError') || 
          hasErrorType(result, 'InventoryError')) {
        
        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(\`Retrying order processing, attempt \${attempt + 1}/\${maxAttempts}\`);
        }
      } else {
        break;
      }
    }

    return lastError!;
  }
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Microservices Communication */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Microservices Communication
          </h2>

          <p className="text-slate-600 mb-4">
            Handling errors in distributed systems with circuit breakers, timeouts, and fallback strategies.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Service Client with Circuit Breaker</h3>
              <CodeBlock
                language="typescript"
                title="Resilient Service Communication"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTryError, createTryError, timeout, retry } from 'try-error';

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

class ServiceClient {
  private circuitBreaker: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 30000; // 30 seconds
  private readonly requestTimeout = 5000; // 5 seconds

  async callService<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<TryResult<T, TryError>> {
    
    // Check circuit breaker
    const circuitState = this.getCircuitState(serviceName);
    if (circuitState.state === 'open') {
      if (Date.now() - circuitState.lastFailureTime < this.recoveryTimeout) {
        return this.handleCircuitOpen(serviceName, fallback);
      } else {
        // Try to recover - move to half-open
        circuitState.state = 'half-open';
        circuitState.successCount = 0;
      }
    }

    // Execute the operation with timeout and retry
    const result = await retry(
      () => timeout(operation, this.requestTimeout),
      {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
        shouldRetry: (error) => {
          return hasErrorType(error, 'NetworkError') || 
                 hasErrorType(error, 'TimeoutError');
        }
      }
    );

    // Update circuit breaker based on result
    this.updateCircuitBreaker(serviceName, result);

    // If operation failed and we have a fallback, try it
    if (isTryError(result) && fallback) {
      console.warn(\`Service \${serviceName} failed, using fallback:`, result.message);
      return tryAsync(fallback);
    }

    return result;
  }

  private getCircuitState(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreaker.has(serviceName)) {
      this.circuitBreaker.set(serviceName, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0
      });
    }
    return this.circuitBreaker.get(serviceName)!;
  }

  private updateCircuitBreaker<T>(serviceName: string, result: TryResult<T, TryError>): void {
    const state = this.getCircuitState(serviceName);

    if (isTryError(result)) {
      state.failureCount++;
      state.lastFailureTime = Date.now();
      state.successCount = 0;

      // Open circuit if failure threshold reached
      if (state.failureCount >= this.failureThreshold) {
        state.state = 'open';
        console.warn(\`Circuit breaker opened for service: \${serviceName}\`);
      }
    } else {
      // Success
      if (state.state === 'half-open') {
        state.successCount++;
        // Close circuit after successful recovery
        if (state.successCount >= 2) {
          state.state = 'closed';
          state.failureCount = 0;
          console.info(\`Circuit breaker closed for service: \${serviceName}\`);
        }
      } else {
        state.failureCount = 0;
      }
    }
  }

  private async handleCircuitOpen<T>(
    serviceName: string, 
    fallback?: () => Promise<T>
  ): Promise<TryResult<T, TryError>> {
    if (fallback) {
      console.info(\`Circuit breaker open for \${serviceName}, using fallback\`);
      return tryAsync(fallback);
    }

    return createTryError('CircuitBreakerError', \`Service \${serviceName} is unavailable\`, {
      serviceName,
      state: 'open',
      retryAfter: this.recoveryTimeout
    });
  }
}

// Usage example
class UserService {
  private serviceClient = new ServiceClient();

  async getUserProfile(userId: string): Promise<TryResult<UserProfile, TryError>> {
    return this.serviceClient.callService(
      'user-profile-service',
      () => this.fetchUserProfileFromAPI(userId),
      () => this.getUserProfileFromCache(userId)
    );
  }

  async getUserPreferences(userId: string): Promise<TryResult<UserPreferences, TryError>> {
    return this.serviceClient.callService(
      'user-preferences-service',
      () => this.fetchUserPreferencesFromAPI(userId),
      () => this.getDefaultUserPreferences()
    );
  }

  private async fetchUserProfileFromAPI(userId: string): Promise<UserProfile> {
    const response = await fetch(\`/api/users/\${userId}/profile\`);
    if (!response.ok) {
      throw createTryError('NetworkError', 'Failed to fetch user profile', {
        userId,
        status: response.status,
        statusText: response.statusText
      });
    }
    return response.json();
  }

  private async getUserProfileFromCache(userId: string): Promise<UserProfile> {
    const cached = await this.cache.get(\`user-profile:\${userId}\`);
    if (!cached) {
      throw createTryError('CacheError', 'User profile not found in cache', { userId });
    }
    return JSON.parse(cached);
  }
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Data Processing Pipeline */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Data Processing Pipeline
          </h2>

          <p className="text-slate-600 mb-4">
            A robust data processing pipeline with validation, transformation, and error recovery.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">ETL Pipeline</h3>
              <CodeBlock
                language="typescript"
                title="Data Processing with Error Handling"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTryError, combineResults, sequenceResults } from 'try-error';

interface DataRecord {
  id: string;
  source: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface ProcessingResult {
  processed: DataRecord[];
  failed: Array<{ record: DataRecord; error: TryError }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

class DataProcessor {
  async processBatch(records: DataRecord[]): Promise<TryResult<ProcessingResult, TryError>> {
    const startTime = Date.now();
    
    return tryAsync(async () => {
      const results = await Promise.all(
        records.map(record => this.processRecord(record))
      );

      const processed: DataRecord[] = [];
      const failed: Array<{ record: DataRecord; error: TryError }> = [];

      results.forEach((result, index) => {
        if (isTryError(result)) {
          failed.push({ record: records[index], error: result });
        } else {
          processed.push(result);
        }
      });

      const duration = Date.now() - startTime;

      // Log processing summary
      console.info('Batch processing completed:', {
        total: records.length,
        successful: processed.length,
        failed: failed.length,
        duration
      });

      return {
        processed,
        failed,
        summary: {
          total: records.length,
          successful: processed.length,
          failed: failed.length,
          duration
        }
      };
    });
  }

  private async processRecord(record: DataRecord): Promise<TryResult<DataRecord, TryError>> {
    // Step 1: Validate record
    const validationResult = await this.validateRecord(record);
    if (isTryError(validationResult)) {
      return validationResult;
    }

    // Step 2: Transform data
    const transformResult = await this.transformRecord(validationResult);
    if (isTryError(transformResult)) {
      return transformResult;
    }

    // Step 3: Enrich with external data
    const enrichResult = await this.enrichRecord(transformResult);
    if (isTryError(enrichResult)) {
      // Enrichment failure is not critical - continue with original data
      console.warn(\`Failed to enrich record \${record.id}:`, enrichResult.message);
      return transformResult;
    }

    // Step 4: Save to database
    const saveResult = await this.saveRecord(enrichResult);
    if (isTryError(saveResult)) {
      return saveResult;
    }

    return enrichResult;
  }

  private async validateRecord(record: DataRecord): Promise<TryResult<DataRecord, TryError>> {
    return tryAsync(async () => {
      // Required fields validation
      if (!record.id) {
        throw createTryError('ValidationError', 'Record ID is required', {
          recordId: record.id,
          field: 'id'
        });
      }

      if (!record.source) {
        throw createTryError('ValidationError', 'Record source is required', {
          recordId: record.id,
          field: 'source'
        });
      }

      // Data type validation
      if (typeof record.data !== 'object' || record.data === null) {
        throw createTryError('ValidationError', 'Record data must be an object', {
          recordId: record.id,
          field: 'data',
          type: typeof record.data
        });
      }

      // Business rule validation
      if (record.source === 'api' && !record.data.userId) {
        throw createTryError('ValidationError', 'API records must include userId', {
          recordId: record.id,
          source: record.source,
          field: 'userId'
        });
      }

      return record;
    });
  }

  private async transformRecord(record: DataRecord): Promise<TryResult<DataRecord, TryError>> {
    return tryAsync(async () => {
      const transformedData = { ...record.data };

      // Normalize field names
      if (transformedData.user_id) {
        transformedData.userId = transformedData.user_id;
        delete transformedData.user_id;
      }

      // Convert timestamps
      if (transformedData.created_at) {
        transformedData.createdAt = new Date(transformedData.created_at);
        delete transformedData.created_at;
      }

      // Validate transformed data
      if (transformedData.email && !this.isValidEmail(transformedData.email)) {
        throw createTryError('TransformationError', 'Invalid email format after transformation', {
          recordId: record.id,
          email: transformedData.email
        });
      }

      return {
        ...record,
        data: transformedData
      };
    });
  }

  private async enrichRecord(record: DataRecord): Promise<TryResult<DataRecord, TryError>> {
    return tryAsync(async () => {
      const enrichedData = { ...record.data };

      // Enrich with user data if userId is present
      if (enrichedData.userId) {
        const userResult = await this.fetchUserData(enrichedData.userId);
        if (!isTryError(userResult)) {
          enrichedData.userProfile = userResult;
        }
      }

      // Enrich with geolocation if IP is present
      if (enrichedData.ipAddress) {
        const locationResult = await this.fetchLocationData(enrichedData.ipAddress);
        if (!isTryError(locationResult)) {
          enrichedData.location = locationResult;
        }
      }

      return {
        ...record,
        data: enrichedData
      };
    });
  }

  private async saveRecord(record: DataRecord): Promise<TryResult<void, TryError>> {
    return tryAsync(async () => {
      await this.database.save('processed_records', record);
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* CLI Application */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            CLI Application
          </h2>

          <p className="text-slate-600 mb-4">
            A command-line tool with comprehensive error handling, user-friendly messages, and graceful degradation.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">File Processing CLI</h3>
              <CodeBlock
                language="typescript"
                title="CLI with Error Handling"
                showLineNumbers={true}
                className="mb-4"
              >
                {`#!/usr/bin/env node
import { tryAsync, isTryError, createTryError, hasErrorType } from 'try-error';
import { promises as fs } from 'fs';
import path from 'path';

interface CLIOptions {
  input: string;
  output?: string;
  format: 'json' | 'csv' | 'xml';
  verbose: boolean;
  force: boolean;
}

class FileProcessorCLI {
  async run(args: string[]): Promise<void> {
    const optionsResult = this.parseArguments(args);
    if (isTryError(optionsResult)) {
      this.handleError(optionsResult);
      process.exit(1);
    }

    const options = optionsResult;
    
    if (options.verbose) {
      console.log('Starting file processing with options:', options);
    }

    const result = await this.processFile(options);
    if (isTryError(result)) {
      this.handleError(result);
      process.exit(1);
    }

    console.log('✅ File processing completed successfully!');
    if (options.output) {
      console.log(\`📁 Output saved to: \${options.output}\`);
    }
  }

  private parseArguments(args: string[]): TryResult<CLIOptions, TryError> {
    try {
      const options: Partial<CLIOptions> = {
        verbose: false,
        force: false,
        format: 'json'
      };

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
          case '--input':
          case '-i':
            options.input = args[++i];
            break;
          case '--output':
          case '-o':
            options.output = args[++i];
            break;
          case '--format':
          case '-f':
            const format = args[++i];
            if (!['json', 'csv', 'xml'].includes(format)) {
              throw createTryError('ValidationError', 'Invalid format specified', {
                format,
                validFormats: ['json', 'csv', 'xml']
              });
            }
            options.format = format as 'json' | 'csv' | 'xml';
            break;
          case '--verbose':
          case '-v':
            options.verbose = true;
            break;
          case '--force':
            options.force = true;
            break;
          case '--help':
          case '-h':
            this.showHelp();
            process.exit(0);
            break;
          default:
            if (arg.startsWith('-')) {
              throw createTryError('ValidationError', \`Unknown option: \${arg}\`, {
                option: arg
              });
            }
        }
      }

      if (!options.input) {
        throw createTryError('ValidationError', 'Input file is required', {
          hint: 'Use --input or -i to specify the input file'
        });
      }

      return options as CLIOptions;
    } catch (error) {
      if (isTryError(error)) {
        return error;
      }
      return createTryError('ParseError', 'Failed to parse command line arguments', {
        originalError: error
      });
    }
  }

  private async processFile(options: CLIOptions): Promise<TryResult<void, TryError>> {
    // Step 1: Validate input file
    const inputValidation = await this.validateInputFile(options.input);
    if (isTryError(inputValidation)) {
      return inputValidation;
    }

    // Step 2: Read and parse input file
    const readResult = await this.readInputFile(options.input);
    if (isTryError(readResult)) {
      return readResult;
    }

    // Step 3: Process data
    const processResult = await this.processData(readResult, options);
    if (isTryError(processResult)) {
      return processResult;
    }

    // Step 4: Write output file
    if (options.output) {
      const writeResult = await this.writeOutputFile(options.output, processResult, options);
      if (isTryError(writeResult)) {
        return writeResult;
      }
    } else {
      // Output to console
      console.log(JSON.stringify(processResult, null, 2));
    }

    return undefined as any; // Success
  }

  private async validateInputFile(inputPath: string): Promise<TryResult<void, TryError>> {
    return tryAsync(async () => {
      try {
        const stats = await fs.stat(inputPath);
        
        if (!stats.isFile()) {
          throw createTryError('FileError', 'Input path is not a file', {
            path: inputPath,
            type: 'directory'
          });
        }

        if (stats.size === 0) {
          throw createTryError('FileError', 'Input file is empty', {
            path: inputPath,
            size: stats.size
          });
        }

        if (stats.size > 100 * 1024 * 1024) { // 100MB limit
          throw createTryError('FileError', 'Input file is too large', {
            path: inputPath,
            size: stats.size,
            maxSize: 100 * 1024 * 1024
          });
        }

      } catch (error) {
        if (error.code === 'ENOENT') {
          throw createTryError('FileError', 'Input file does not exist', {
            path: inputPath,
            code: error.code
          });
        }
        if (error.code === 'EACCES') {
          throw createTryError('FileError', 'Permission denied accessing input file', {
            path: inputPath,
            code: error.code
          });
        }
        throw error;
      }
    });
  }

  private async readInputFile(inputPath: string): Promise<TryResult<any[], TryError>> {
    return tryAsync(async () => {
      const content = await fs.readFile(inputPath, 'utf-8');
      const ext = path.extname(inputPath).toLowerCase();

      switch (ext) {
        case '.json':
          try {
            const data = JSON.parse(content);
            return Array.isArray(data) ? data : [data];
          } catch (parseError) {
            throw createTryError('ParseError', 'Invalid JSON format', {
              path: inputPath,
              error: parseError.message
            });
          }
        
        case '.csv':
          return this.parseCSV(content);
        
        default:
          throw createTryError('FileError', 'Unsupported file format', {
            path: inputPath,
            extension: ext,
            supportedFormats: ['.json', '.csv']
          });
      }
    });
  }

  private handleError(error: TryError): void {
    console.error('❌ Error:', error.message);

    if (hasErrorType(error, 'ValidationError')) {
      console.error('💡 Validation issue:', error.context);
      if (error.context?.hint) {
        console.error('💡 Hint:', error.context.hint);
      }
    } else if (hasErrorType(error, 'FileError')) {
      console.error('📁 File issue:', error.context);
      if (error.context?.code === 'ENOENT') {
        console.error('💡 Make sure the file path is correct and the file exists');
      } else if (error.context?.code === 'EACCES') {
        console.error('💡 Check file permissions or run with appropriate privileges');
      }
    } else if (hasErrorType(error, 'ParseError')) {
      console.error('🔍 Parse issue:', error.context);
      console.error('💡 Check the file format and content structure');
    }

    if (error.context?.originalError) {
      console.error('🔧 Technical details:', error.context.originalError);
    }
  }

  private showHelp(): void {
    console.log(\`
File Processor CLI

Usage: file-processor [options]

Options:
  -i, --input <file>     Input file path (required)
  -o, --output <file>    Output file path (optional, prints to console if not specified)
  -f, --format <format>  Output format: json, csv, xml (default: json)
  -v, --verbose          Enable verbose logging
  --force                Overwrite output file if it exists
  -h, --help             Show this help message

Examples:
  file-processor -i data.json -o processed.json
  file-processor -i data.csv -o result.xml -f xml
  file-processor -i input.json --verbose
\`);
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new FileProcessorCLI();
  cli.run(process.argv.slice(2));
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Best Practices Summary */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Production Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Error Handling Patterns</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Use circuit breakers for external service calls</li>
                <li>• Implement comprehensive rollback mechanisms</li>
                <li>• Provide meaningful fallback strategies</li>
                <li>• Add retry logic with exponential backoff</li>
                <li>• Include detailed context in error objects</li>
                <li>• Log errors with appropriate severity levels</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🔧 Operational Considerations</h4>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Monitor error rates and patterns</li>
                <li>• Set up alerts for critical error types</li>
                <li>• Implement health checks and readiness probes</li>
                <li>• Use structured logging for better observability</li>
                <li>• Track error recovery success rates</li>
                <li>• Implement graceful degradation strategies</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚡ Performance Tips</h4>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>• Use timeouts to prevent hanging operations</li>
                <li>• Implement request deduplication for retries</li>
                <li>• Cache fallback data when possible</li>
                <li>• Use async processing for non-critical operations</li>
                <li>• Batch operations to reduce overhead</li>
                <li>• Monitor and optimize error handling paths</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Basic Examples</h3>
              <p className="text-slate-600 text-sm mb-3">
                Start with fundamental patterns and use cases
              </p>
              <a
                href="/docs/examples/basic"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Basic Examples →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Migration Guide</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn how to adopt try-error in existing projects
              </p>
              <a
                href="/docs/migration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Migration Guide →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
