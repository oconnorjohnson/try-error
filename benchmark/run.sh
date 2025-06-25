#!/bin/bash

echo "Building the library..."
pnpm build

echo ""
echo "Running performance benchmarks..."
echo ""

# Run standard benchmarks
echo "=== Standard Benchmarks ==="
npx tsx benchmark/index.ts

echo ""
echo ""
echo "=== Memory Benchmarks (with GC exposed) ==="
node --expose-gc dist/benchmark/index.js

echo ""
echo "Done!" 