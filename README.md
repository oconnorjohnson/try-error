# try-error Documentation Website

A comprehensive documentation website for the try-error TypeScript library, built with Next.js 15, React Server Components, and shadcn/ui.

## 🎯 Documentation Structure

### **Core Documentation Pages**

#### **1. Getting Started**

- **Introduction** - What is try-error, why use it, key benefits
- **Installation** - Package installation, setup instructions
- **Quick Start** - 5-minute tutorial with basic examples
- **Migration Guide** - From try-catch to try-error patterns

#### **2. Core Concepts**

- **Error Handling Philosophy** - Progressive adoption, type safety, zero overhead
- **TryResult vs Exceptions** - When to use each approach
- **Error Types** - Built-in types, custom error types, discriminated unions
- **Success vs Error Paths** - Handling both cases effectively

#### **3. API Reference**

##### **Synchronous Operations**

- `trySync()` - Basic sync error handling
- `trySyncTuple()` - Go-style tuple returns
- `tryCall()` - Function call wrapping
- `unwrap()` / `unwrapOr()` / `unwrapOrElse()` - Result extraction
- `isOk()` / `isErr()` - Type guards
- `tryAll()` / `tryAny()` - Multiple operations

##### **Asynchronous Operations**

- `tryAsync()` - Basic async error handling
- `tryAsyncTuple()` - Async tuple returns
- `tryAwait()` - Promise wrapping
- `tryAllAsync()` / `tryAnyAsync()` - Parallel operations
- `tryAnySequential()` - Sequential fallback
- `withTimeout()` - Timeout handling
- `retry()` - Retry mechanisms

##### **Error Creation & Management**

- `createError()` - Error creation
- `wrapError()` - Error wrapping
- `fromThrown()` - Exception conversion
- `isTryError()` - Type checking
- Error context and metadata

##### **Utilities**

- `transformResult()` - Result transformation
- `withDefault()` / `withDefaultFn()` - Default values
- `filterSuccess()` / `filterErrors()` - Array filtering
- `partitionResults()` - Result separation
- `combineErrors()` - Error aggregation

#### **4. React Integration**

- **Installation** - `@try-error/react` setup
- **Hooks**
  - `useTry()` - Async state management
  - `useTrySync()` - Sync operations
  - `useTryCallback()` - Memoized callbacks
  - `useFormSubmitCallback()` - Form handling
- **Components**
  - `TryErrorBoundary` - Error boundaries
  - `withTryErrorBoundary()` - HOC wrapper
- **Types** - React-specific TypeScript types

#### **5. Advanced Patterns**

##### **Custom Error Types**

- Defining domain-specific errors
- Error factories and builders
- Error chaining and context
- Validation error patterns

##### **Error Factories**

- `createErrorFactory()` - Factory functions
- Domain-specific error creation
- Entity, Amount, External, Validation errors
- Error inheritance patterns

##### **Performance & Best Practices**

- Zero-overhead success paths
- Memory management
- Error context optimization
- Bundle size considerations

#### **6. Examples & Tutorials**

##### **Basic Examples**

- Simple error handling
- Form validation
- API calls and data fetching
- File operations

##### **Real-World Scenarios**

- E-commerce checkout flow
- User authentication
- Data processing pipelines
- External API integration

##### **React Examples**

- Component error handling
- Form validation with hooks
- Async data loading
- Error boundary implementation

#### **7. Guides**

##### **Migration Guides**

- From try-catch blocks
- From Result/Either libraries
- From Promise.catch()
- From error-first callbacks

##### **Integration Guides**

- Express.js middleware
- Next.js applications
- React applications
- Node.js services
- Testing strategies

#### **8. Reference**

##### **TypeScript Types**

- Complete type definitions
- Generic constraints
- Utility types
- Type inference examples

##### **Error Codes**

- Built-in error types
- Error severity levels
- Context field standards
- Debugging information

##### **Configuration**

- Environment variables
- Build-time options
- Runtime configuration
- Development vs production

## 🏗️ Technical Implementation

### **Content Management**

- **MDX Files** - Markdown with React components for rich content
- **File-based Routing** - Next.js app router for automatic page generation
- **Static Generation** - Pre-rendered pages for optimal performance
- **Syntax Highlighting** - PrismJS for code examples

### **UI Components**

- **shadcn/ui** - Consistent, accessible component library
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching support
- **Search** - Full-text search across documentation

### **Features**

- **Interactive Examples** - Live code playground
- **Copy-to-Clipboard** - Easy code copying
- **Navigation** - Sidebar, breadcrumbs, next/prev links
- **Table of Contents** - Auto-generated from headings
- **SEO Optimized** - Meta tags, structured data

### **Development**

- **TypeScript** - Full type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Hot Reload** - Fast development iteration

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (docs)/            # Documentation routes
│   ├── api/               # API routes (search, etc.)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── docs/              # Documentation-specific components
│   └── layout/            # Layout components
├── content/               # MDX documentation files
│   ├── docs/              # Main documentation
│   ├── examples/          # Code examples
│   └── guides/            # Tutorial guides
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

- **Typography** - Clear hierarchy with proper contrast
- **Color Palette** - Accessible colors with dark mode support
- **Spacing** - Consistent spacing scale
- **Components** - Reusable, composable UI elements
- **Icons** - Lucide React icon library

## 📝 Content Guidelines

- **Clear Examples** - Every concept includes working code
- **Progressive Complexity** - Start simple, build up
- **Real-World Focus** - Practical, applicable examples
- **TypeScript First** - Full type safety demonstrated
- **Performance Aware** - Highlight zero-overhead benefits
