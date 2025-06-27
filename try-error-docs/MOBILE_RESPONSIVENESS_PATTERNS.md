# Mobile Responsiveness Patterns for try-error-docs

## Overview

This document outlines the standard patterns for making all documentation pages mobile-responsive using Tailwind CSS responsive modifiers.

## Core Patterns

### 1. Container/Page Wrapper

```tsx
// ❌ Before
<div className="max-w-4xl mx-auto py-8 px-6">

// ✅ After
<div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
```

### 2. Main Headings

```tsx
// Page title (h1)
// ❌ Before
<h1 className="text-4xl font-bold text-slate-900 mb-4">

// ✅ After
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">

// Subtitle/description
// ❌ Before
<p className="text-xl text-slate-600">

// ✅ After
<p className="text-base sm:text-lg md:text-xl text-slate-600">
```

### 3. Section Headings

```tsx
// Section title (h2)
// ❌ Before
<h2 className="text-2xl font-semibold text-slate-900 mb-4">

// ✅ After
<h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">

// Subsection title (h3)
// ❌ Before
<h3 className="text-lg font-semibold text-slate-900 mb-3">

// ✅ After
<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
```

### 4. Body Text

```tsx
// Regular paragraphs
// ❌ Before
<p className="text-slate-600 mb-4">

// ✅ After
<p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">

// Small text
// ❌ Before
<p className="text-sm text-slate-600 mb-3">

// ✅ After
<p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
```

### 5. Code Elements

```tsx
// Inline code
// ❌ Before
<code className="bg-slate-100 px-2 py-1 rounded">

// ✅ After
<code className="bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">

// Code blocks
// ❌ Before
<CodeBlock language="typescript" className="mb-4">

// ✅ After
<CodeBlock language="typescript" className="mb-3 sm:mb-4 text-xs sm:text-sm">
```

### 6. Cards and Containers

```tsx
// Card/box padding
// ❌ Before
<div className="border border-slate-200 rounded-lg p-4">

// ✅ After
<div className="border border-slate-200 rounded-lg p-3 sm:p-4">

// Alert/notification boxes
// ❌ Before
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

// ✅ After
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
```

### 7. Grid Layouts

```tsx
// Two column grid
// ❌ Before
<div className="grid md:grid-cols-2 gap-4">

// ✅ After
<div className="grid sm:grid-cols-2 gap-3 sm:gap-4">

// Three column grid
// ❌ Before
<div className="grid md:grid-cols-3 gap-4">

// ✅ After
<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
```

### 8. Spacing

```tsx
// Section spacing
// ❌ Before
<div className="space-y-8">

// ✅ After
<div className="space-y-6 sm:space-y-8">

// Margin bottom
// ❌ Before
<div className="mb-8">

// ✅ After
<div className="mb-6 sm:mb-8">
```

### 9. Buttons and Links

```tsx
// Button padding
// ❌ Before
<button className="px-8 py-4 text-base">

// ✅ After
<button className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">

// Link text
// ❌ Before
<a className="text-blue-600 text-sm font-medium">

// ✅ After
<a className="text-blue-600 text-xs sm:text-sm font-medium">
```

### 10. Icons

```tsx
// Icon sizes
// ❌ Before
<Icon className="h-5 w-5" />

// ✅ After
<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
```

## Breakpoint Reference

- `sm:` - 640px and up (small devices)
- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (desktops)
- `xl:` - 1280px and up (large screens)

## Testing Checklist

- [ ] Test on 320px width (smallest mobile)
- [ ] Test on 375px width (iPhone SE)
- [ ] Test on 414px width (iPhone Plus)
- [ ] Test on 768px width (iPad)
- [ ] Check text readability at all sizes
- [ ] Verify touch targets are at least 44x44px
- [ ] Ensure horizontal scrolling only for code blocks
- [ ] Verify proper spacing between elements
- [ ] Check that buttons stack properly on mobile
- [ ] Test navigation and sidebar behavior

## Common Issues to Watch For

1. **Text too large on mobile** - Use responsive text sizes
2. **Insufficient padding** - Reduce padding on mobile for more content space
3. **Fixed widths** - Avoid fixed pixel widths, use responsive units
4. **Hover-only interactions** - Ensure all features work with touch
5. **Dense grids** - Stack columns on mobile devices
6. **Long code lines** - Ensure code blocks scroll horizontally

## Implementation Strategy

1. Start with the container/wrapper div
2. Update all headings with responsive sizes
3. Fix body text and paragraphs
4. Update code blocks and inline code
5. Fix grids to stack on mobile
6. Adjust spacing throughout
7. Test on multiple devices
8. Update tracking document
