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

### 🔄 IN PROGRESS / TODO PAGES

#### Core Documentation

- [ ] `/docs/migration` - Migration guide

#### Concepts (3 pages remaining)

- [ ] `/docs/concepts/error-types` - 6 code blocks
- [ ] `/docs/concepts/success-vs-error` - Basic page

#### API Reference (4 pages)

- [ ] `/docs/api/sync` - 10 code blocks
- [ ] `/docs/api/async` - Multiple code blocks
- [ ] `/docs/api/errors` - Multiple code blocks
- [ ] `/docs/api/utils` - Multiple code blocks

#### Examples (3 pages)

- [ ] `/docs/examples/basic` - 6 code blocks
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
   - `/docs/examples/basic`
   - `/docs/api/sync`

2. **Medium Priority**:

   - All other concept pages
   - API reference pages
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
- Completed: 7 pages (28%)
- Remaining: 18 pages (72%)
- Estimated Code Blocks: 100+
