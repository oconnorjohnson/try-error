# Code Block Migration Sitemap & Progress Tracker

## Goal

Replace ALL code blocks across the entire try-error documentation with enhanced syntax highlighting, copy functionality, and package manager selection.

## Migration Pattern

1. Add import: `import { CodeBlock, InstallCommand } from '../../../components/EnhancedCodeBlock';`
2. Replace `<div className="bg-slate-900..."><pre><code>` with `<CodeBlock language="..." title="...">`
3. For install commands, use `<InstallCommand packageName="..." />`
4. Add appropriate language tags (typescript, tsx, json, bash, etc.)
5. Add meaningful titles where helpful

## Complete Sitemap & Status

### ✅ COMPLETED PAGES

- [x] `/docs/installation` - ✅ Already updated
- [x] `/docs/react/installation` - ✅ Already updated
- [x] `/docs/demo/code-blocks` - ✅ Demo page
- [x] `/docs/quick-start` - ✅ Just completed (6 code blocks)
- [x] `/docs` (page.tsx) - ✅ Just completed (2 code blocks)
- [x] `/docs/concepts/philosophy` - ✅ Just completed (4 code blocks)
- [x] `/docs/concepts/tryresult-vs-exceptions` - ✅ Just completed (8 code blocks)
- [x] `/docs/examples/basic` - ✅ Just completed (6 code blocks)
- [x] `/docs/api/sync` - ✅ Just completed (10 code blocks)
- [x] `/docs/concepts/error-types` - ✅ Just completed (6 code blocks)
- [x] `/docs/api/async` - ✅ Just completed (7 code blocks)

### 🔄 IN PROGRESS / TODO PAGES

#### Core Documentation

- [ ] `/docs/migration` - Migration guide

#### Concepts (1 page remaining)

- [ ] `/docs/concepts/success-vs-error` - Basic page

#### API Reference (2 pages remaining)

- [ ] `/docs/api/errors` - Multiple code blocks
- [ ] `/docs/api/utils` - Multiple code blocks

#### Examples (2 pages remaining)

- [ ] `/docs/examples/real-world` - Multiple code blocks
- [ ] `/docs/examples/react` - 3 code blocks

#### React Integration (3 pages)

- [ ] `/docs/react/hooks` - 8 code blocks
- [ ] `/docs/react/components` - Multiple code blocks
- [ ] `/docs/react/types` - Multiple code blocks

#### Guides (2 pages)

- [ ] `/docs/guides/migration` - 11 code blocks
- [ ] `/docs/guides/integration` - Multiple code blocks

#### Reference (3 pages)

- [ ] `/docs/reference/types` - 17 code blocks
- [ ] `/docs/reference/error-codes` - 9 code blocks
- [ ] `/docs/reference/configuration` - 12 code blocks

#### Advanced (3 pages)

- [ ] `/docs/advanced/custom-errors` - Multiple code blocks
- [ ] `/docs/advanced/factories` - Multiple code blocks
- [ ] `/docs/advanced/performance` - 9 code blocks

## Priority Order

1. **High Priority** (user-facing, frequently accessed):

   - ✅ `/docs` (main intro) - COMPLETED
   - ✅ `/docs/concepts/philosophy` - COMPLETED
   - ✅ `/docs/concepts/tryresult-vs-exceptions` - COMPLETED
   - ✅ `/docs/examples/basic` - COMPLETED
   - ✅ `/docs/api/sync` - COMPLETED

2. **Medium Priority**:

   - ✅ `/docs/concepts/error-types` - COMPLETED
   - ✅ `/docs/api/async` - COMPLETED
   - `/docs/api/errors`
   - React integration pages
   - Migration guides

3. **Lower Priority**:
   - Advanced topics
   - Configuration references

## Code Block Count Estimate

Based on grep search results: **100+ code blocks** across all pages

## Notes

- Use relative imports to avoid path resolution issues
- TypeScript/JavaScript code should use `language="typescript"` or `language="tsx"`
- Installation commands should use `InstallCommand` component
- JSON configs should use `language="json"`
- Shell commands should use `language="bash"`
- Add titles for better UX: "Basic Example", "Advanced Usage", etc.
- Enable line numbers for longer examples with `showLineNumbers={true}`

## Progress Tracking

- Total Pages: ~25 pages
- Completed: 11 pages (44%)
- Remaining: 14 pages (56%)
- Estimated Code Blocks: 100+

## Recent Completions

- ✅ Main docs intro (2 code blocks)
- ✅ Philosophy page (4 code blocks)
- ✅ TryResult vs Exceptions (8 code blocks)
- ✅ Basic Examples (6 code blocks)
- ✅ Sync API Reference (10 code blocks)
- ✅ Error Types (6 code blocks)
- ✅ Async API Reference (7 code blocks)

**Total code blocks updated so far: ~49 code blocks**

## Momentum Building! 🚀

We're now at 44% completion with nearly 50 code blocks updated! The major API reference pages and core concepts are done. Next up: Error API and remaining examples.
