# Production Deployment Guide: RAG Documentation System

## Overview

This guide provides comprehensive instructions for deploying the try-error RAG documentation system in production environments. The system includes semantic chunking, vector database integration, and intelligent query processing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Production RAG System                    │
├─────────────────────────────────────────────────────────────┤
│  Load Balancer (nginx/cloudflare)                         │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (Express.js/Fastify)                         │
├─────────────────────────────────────────────────────────────┤
│  RAG Processing Layer                                      │
│  ├─ Query Processing    ├─ Vector Search                   │
│  ├─ Semantic Chunking   ├─ Embedding Generation           │
│  └─ Response Generation                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├─ Vector Database (Pinecone/Weaviate/local)             │
│  ├─ Document Storage (S3/local)                           │
│  └─ Cache Layer (Redis/Memcached)                         │
├─────────────────────────────────────────────────────────────┤
│  Monitoring & Observability                               │
│  ├─ Application Metrics (Prometheus/DataDog)              │
│  ├─ Logging (Winston/Pino)                                │
│  └─ Health Checks                                         │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **Memory**: Minimum 4GB RAM, recommended 8GB+ for production
- **Storage**: 10GB+ available space for document storage and indexes
- **CPU**: 2+ cores recommended for concurrent processing

### Required Services

- **Database**: PostgreSQL/MongoDB for metadata storage
- **Vector Database**: Choose one:
  - **Pinecone** (managed, easiest setup)
  - **Weaviate** (open-source, self-hosted)
  - **Local Vector Store** (for development/small deployments)
- **Cache**: Redis (recommended) or Memcached
- **Monitoring**: Prometheus + Grafana or DataDog

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### 1. Create Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
```

#### 2. Docker Compose for Complete Stack

```yaml
# docker-compose.yml
version: "3.8"

services:
  rag-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/ragdb
      - REDIS_URL=redis://redis:6379
      - VECTOR_DB_URL=http://weaviate:8080
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
      - weaviate
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=ragdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    environment:
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate_data:/var/lib/weaviate
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - rag-api
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  weaviate_data:
  grafana_data:
```

### Option 2: Kubernetes Deployment

#### 1. Create Kubernetes Manifests

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-api
  labels:
    app: rag-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rag-api
  template:
    metadata:
      labels:
        app: rag-api
    spec:
      containers:
        - name: rag-api
          image: your-registry/rag-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: rag-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: rag-secrets
                  key: redis-url
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: rag-secrets
                  key: openai-api-key
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: rag-api-service
spec:
  selector:
    app: rag-api
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

### Option 3: Cloud Platform Deployment

#### Vercel/Netlify (Serverless)

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### AWS Lambda with API Gateway

```javascript
// serverless.yml
service: rag-documentation-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
      Resource: "arn:aws:dynamodb:*:*:table/rag-*"

functions:
  api:
    handler: src/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 1024

plugins:
  - serverless-offline
  - serverless-webpack
```

## Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ragdb
REDIS_URL=redis://localhost:6379

# Vector Database
VECTOR_DB_TYPE=pinecone # or weaviate, local
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=rag-docs
WEAVIATE_URL=http://localhost:8080

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002

# Performance Configuration
MAX_CONCURRENT_REQUESTS=100
EMBEDDING_BATCH_SIZE=50
CACHE_TTL=3600
QUERY_TIMEOUT=30000

# Monitoring
PROMETHEUS_PORT=9090
LOG_LEVEL=info
METRICS_ENABLED=true
```

### Application Configuration

```javascript
// config/production.js
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
  },

  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      idle: 30000,
    },
  },

  redis: {
    url: process.env.REDIS_URL,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  },

  vectorDb: {
    type: process.env.VECTOR_DB_TYPE || "local",
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      indexName: process.env.PINECONE_INDEX_NAME,
    },
    weaviate: {
      url: process.env.WEAVIATE_URL,
    },
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4",
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-ada-002",
  },

  performance: {
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 100,
    embeddingBatchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE) || 50,
    cacheTtl: parseInt(process.env.CACHE_TTL) || 3600,
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT) || 30000,
  },

  monitoring: {
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT) || 9090,
    logLevel: process.env.LOG_LEVEL || "info",
    metricsEnabled: process.env.METRICS_ENABLED === "true",
  },
};
```

## Monitoring & Observability

### Application Metrics

```javascript
// monitoring/metrics.js
const prometheus = require("prom-client");

// Create metrics
const httpRequestsTotal = new prometheus.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
});

const vectorSearchDuration = new prometheus.Histogram({
  name: "vector_search_duration_seconds",
  help: "Duration of vector searches in seconds",
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const embeddingGenerationDuration = new prometheus.Histogram({
  name: "embedding_generation_duration_seconds",
  help: "Duration of embedding generation in seconds",
});

const cacheHitRate = new prometheus.Gauge({
  name: "cache_hit_rate",
  help: "Cache hit rate percentage",
});

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,
  vectorSearchDuration,
  embeddingGenerationDuration,
  cacheHitRate,
  register: prometheus.register,
};
```

### Health Checks

```javascript
// health/checks.js
const healthChecks = {
  async database() {
    try {
      await db.query("SELECT 1");
      return { status: "healthy", latency: Date.now() };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  },

  async redis() {
    try {
      const start = Date.now();
      await redis.ping();
      return { status: "healthy", latency: Date.now() - start };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  },

  async vectorDatabase() {
    try {
      const start = Date.now();
      await vectorDb.healthCheck();
      return { status: "healthy", latency: Date.now() - start };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  },

  async openai() {
    try {
      const start = Date.now();
      // Simple embedding test
      await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: "health check",
      });
      return { status: "healthy", latency: Date.now() - start };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  },
};

module.exports = healthChecks;
```

### Logging Configuration

```javascript
// logging/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "rag-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

## Security Considerations

### API Security

```javascript
// security/middleware.js
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),

  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  }),

  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  }),
];

module.exports = securityMiddleware;
```

### Data Privacy

```javascript
// security/privacy.js
const crypto = require("crypto");

class DataPrivacy {
  // Anonymize user queries for logging
  static anonymizeQuery(query) {
    const hash = crypto.createHash("sha256").update(query).digest("hex");
    return `query_${hash.substring(0, 8)}`;
  }

  // Sanitize error messages
  static sanitizeError(error) {
    const sanitized = { ...error };
    delete sanitized.stack;
    delete sanitized.config;
    return sanitized;
  }

  // Check for sensitive data in responses
  static filterSensitiveData(response) {
    // Remove API keys, tokens, etc.
    const sensitivePatterns = [
      /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
      /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/g, // Credit card patterns
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
    ];

    let filtered = response;
    sensitivePatterns.forEach((pattern) => {
      filtered = filtered.replace(pattern, "[REDACTED]");
    });

    return filtered;
  }
}

module.exports = DataPrivacy;
```

## Performance Optimization

### Caching Strategy

```javascript
// cache/strategy.js
const Redis = require("ioredis");

class CacheStrategy {
  constructor(redis) {
    this.redis = redis;
    this.defaultTTL = 3600; // 1 hour
  }

  // Cache embedding vectors
  async cacheEmbedding(text, embedding) {
    const key = `embedding:${crypto
      .createHash("md5")
      .update(text)
      .digest("hex")}`;
    await this.redis.setex(
      key,
      this.defaultTTL * 24,
      JSON.stringify(embedding)
    );
  }

  async getCachedEmbedding(text) {
    const key = `embedding:${crypto
      .createHash("md5")
      .update(text)
      .digest("hex")}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache search results
  async cacheSearchResult(query, results) {
    const key = `search:${crypto
      .createHash("md5")
      .update(query)
      .digest("hex")}`;
    await this.redis.setex(key, this.defaultTTL, JSON.stringify(results));
  }

  async getCachedSearchResult(query) {
    const key = `search:${crypto
      .createHash("md5")
      .update(query)
      .digest("hex")}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
}

module.exports = CacheStrategy;
```

### Connection Pooling

```javascript
// database/pool.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  min: 5,
  idle: 30000,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
```

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Vector database indexed with latest documents
- [ ] SSL certificates installed
- [ ] Monitoring dashboards configured
- [ ] Health check endpoints tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Backup strategy implemented

### Post-deployment

- [ ] Health checks passing
- [ ] Metrics collecting properly
- [ ] Logs flowing to aggregation system
- [ ] Performance metrics within acceptable range
- [ ] Error rates below threshold
- [ ] Cache hit rates optimal
- [ ] Alert rules configured
- [ ] Documentation updated

## Troubleshooting Guide

### Common Issues

#### High Memory Usage

```bash
# Check memory usage
docker stats
kubectl top pods

# Solutions:
# 1. Increase memory limits
# 2. Optimize embedding batch size
# 3. Implement memory-efficient chunking
```

#### Slow Query Performance

```bash
# Check query performance
curl -X GET "http://localhost:3000/metrics" | grep vector_search_duration

# Solutions:
# 1. Add more vector database replicas
# 2. Optimize embedding dimensions
# 3. Implement query caching
```

#### Vector Database Connection Issues

```javascript
// Health check script
const healthCheck = async () => {
  try {
    const response = await fetch("http://localhost:8080/v1/meta");
    console.log("Weaviate status:", response.ok ? "healthy" : "unhealthy");
  } catch (error) {
    console.error("Weaviate connection failed:", error.message);
  }
};
```

### Monitoring Queries

```promql
# Prometheus queries for monitoring

# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time 95th percentile
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Vector search performance
histogram_quantile(0.95, rate(vector_search_duration_seconds_bucket[5m]))

# Cache hit rate
cache_hit_rate

# Memory usage
process_resident_memory_bytes
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**: Use nginx or cloud load balancer
2. **Stateless Design**: Ensure application is stateless
3. **Database Sharding**: Consider sharding for large datasets
4. **Caching Layer**: Redis cluster for high availability

### Vertical Scaling

1. **Memory**: Increase for larger embedding caches
2. **CPU**: More cores for concurrent processing
3. **Storage**: Fast SSDs for vector database performance

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Vector database backup (Weaviate)
curl -X POST "http://localhost:8080/v1/backups/filesystem" \
  -H "Content-Type: application/json" \
  -d '{"id":"backup-001"}'
```

### Disaster Recovery

1. **Regular Backups**: Daily database and vector store backups
2. **Multi-region**: Deploy across multiple regions
3. **Monitoring**: Alert on backup failures
4. **Recovery Testing**: Regular recovery drills

## Cost Optimization

### OpenAI API Costs

- Cache embeddings to avoid regeneration
- Batch embedding requests
- Use cheaper models for development
- Implement request throttling

### Infrastructure Costs

- Use spot instances for non-critical workloads
- Implement auto-scaling
- Monitor resource utilization
- Optimize container sizes

## Support and Maintenance

### Regular Tasks

- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Performance review monthly
- [ ] Security audit quarterly
- [ ] Backup verification weekly

### Contact Information

- **Technical Support**: [Your support email]
- **Documentation**: [Your docs URL]
- **Status Page**: [Your status page URL]

---

This deployment guide provides a comprehensive foundation for production deployment of the RAG documentation system. Adjust configurations based on your specific requirements and infrastructure constraints.
