import React from "react";
import { render } from "@testing-library/react";
import { TryErrorBoundary } from "../src/components/TryErrorBoundary";

describe("TryErrorBoundary", () => {
  it("should render children", () => {
    const { getByText } = render(
      <TryErrorBoundary>
        <div>Test content</div>
      </TryErrorBoundary>
    );

    expect(getByText("Test content")).toBeInTheDocument();
  });
});
