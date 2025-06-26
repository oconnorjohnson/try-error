#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building the library...${NC}"
pnpm build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Running comprehensive benchmark suite...${NC}"
echo ""

# 1. Standard benchmarks
echo -e "${YELLOW}=== Standard Performance Benchmarks ===${NC}"
npx tsx benchmark/index.ts

echo ""
echo ""

# 2. Minimal overhead analysis
echo -e "${YELLOW}=== Minimal Overhead Analysis ===${NC}"
npx tsx benchmark/minimal-overhead.ts

echo ""
echo ""

# 3. Library comparison
echo -e "${YELLOW}=== Library Comparison ===${NC}"
npx tsx benchmark/compare.ts

echo ""
echo ""

# 4. Real-world scenarios
echo -e "${YELLOW}=== Real-World Scenarios ===${NC}"
npx tsx benchmark/scenarios/real-world.ts

echo ""
echo ""

# 5. Memory profiling (requires --expose-gc)
echo -e "${YELLOW}=== Memory Profiling ===${NC}"
node --expose-gc -r tsx/cjs benchmark/memory/profiler.ts

echo ""
echo ""

# 6. Check for regressions (if baseline exists)
if [ -f "benchmark/baseline.json" ]; then
    echo -e "${YELLOW}=== Performance Regression Check ===${NC}"
    npx tsx benchmark/regression/check.ts
else
    echo -e "${YELLOW}No baseline found. Run with --save-baseline to create one.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Benchmark suite complete!${NC}"

# Check if we should save baseline
if [[ "$1" == "--save-baseline" ]]; then
    echo -e "${BLUE}Note: Baseline saving should be implemented in individual benchmark scripts${NC}"
    echo -e "${BLUE}Run benchmarks with appropriate flags to save baselines${NC}"
fi 