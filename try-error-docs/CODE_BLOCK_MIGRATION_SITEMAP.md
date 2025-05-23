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
- [x] `/docs/examples/react` - ✅ Just completed (3 code blocks)
- [x] `/docs/migration` - ✅ Just completed (8 code blocks)
- [x] `/docs/guides/migration` - ✅ Just completed (11 code blocks)
- [x] `/docs/react/hooks` - ✅ Just completed (8 code blocks)
- [x] `/docs/guides/integration` - ✅ Just completed (8 code blocks)
- [x] `/docs/react/components` - ✅ Just completed (10 code blocks)

### 🔄 IN PROGRESS / TODO PAGES

#### Core Documentation

- [ ] `/docs/concepts/success-vs-error` - Basic page

#### API Reference (2 pages remaining)

- [ ] `/docs/api/errors` - Placeholder page (no code blocks)
- [ ] `/docs/api/utils` - Placeholder page (no code blocks)

#### Examples (1 page remaining)

- [ ] `/docs/examples/real-world` - Placeholder page (no code blocks)

#### React Integration (1 page remaining)

- [ ] `/docs/react/types` - Multiple code blocks

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
   - ✅ `/docs/examples/react` - COMPLETED
   - ✅ `/docs/migration` - COMPLETED
   - ✅ `/docs/guides/migration` - COMPLETED
   - ✅ `/docs/react/hooks` - COMPLETED
   - React integration pages

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
- Completed: 17 pages (68%)
- Remaining: 8 pages (32%)
- Estimated Code Blocks: 100+

## Recent Completions

- ✅ Main docs intro (2 code blocks)
- ✅ Philosophy page (4 code blocks)
- ✅ TryResult vs Exceptions (8 code blocks)
- ✅ Basic Examples (6 code blocks)
- ✅ Sync API Reference (10 code blocks)
- ✅ Error Types (6 code blocks)
- ✅ Async API Reference (7 code blocks)
- ✅ React Examples (3 code blocks)
- ✅ Migration Guide (8 code blocks)
- ✅ Guides Migration (11 code blocks)
- ✅ React Hooks (8 code blocks)
- ✅ Guides Integration (8 code blocks)
- ✅ React Components (10 code blocks)

**Total code blocks updated so far: ~97 code blocks**

## 🎉 MAJOR MILESTONE REACHED!

We're now at 68% completion with 97+ code blocks updated! Nearly all the major high-priority pages are done. The core API references, key concepts, main examples, migration guides, and React integration are all enhanced with beautiful syntax highlighting and copy functionality.

## Remaining Work

Most remaining pages are either placeholder pages or reference documentation. The heavy lifting is done!
