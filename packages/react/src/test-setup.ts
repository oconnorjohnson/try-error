import "@testing-library/jest-dom";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global test utilities
beforeEach(() => {
  // Reset any mocks or test state here
});

afterEach(() => {
  // Cleanup after each test
});
