import { createError } from "@try-error/core";
import {
  isReactTryError,
  isComponentError,
  isRenderError,
  isEffectError,
  isEventHandlerError,
  isFormSubmissionError,
  isValidationError,
  isAsyncComponentError,
  isStateUpdateError,
  isAbortedError,
  isComponentUnmountedError,
  isUnexpectedError,
  isReactError,
  hasFieldErrors,
  isRetryableError,
  getComponentName,
  getFieldErrors,
  isErrorFromComponent,
  isTryState,
  isRetryableTryState,
  isFormTryState,
  createReactError,
  type TryState,
  type RetryableTryState,
  type FormTryState,
} from "../../src/types";

describe("Type Predicates", () => {
  describe("isReactTryError", () => {
    it("should return true for valid ReactTryError", () => {
      const error = createError({
        type: "ComponentError",
        message: "Test error",
      });
      expect(isReactTryError(error)).toBe(true);
    });

    it("should return false for non-TryError objects", () => {
      expect(isReactTryError(new Error("Regular error"))).toBe(false);
      expect(isReactTryError("string")).toBe(false);
      expect(isReactTryError(null)).toBe(false);
      expect(isReactTryError(undefined)).toBe(false);
      expect(isReactTryError({})).toBe(false);
    });
  });

  describe("Specific error type predicates", () => {
    it("should correctly identify ComponentError", () => {
      const error = createReactError("ComponentError", "Component failed");
      expect(isComponentError(error)).toBe(true);
      expect(isRenderError(error)).toBe(false);
    });

    it("should correctly identify RenderError", () => {
      const error = createReactError("RenderError", "Render failed");
      expect(isRenderError(error)).toBe(true);
      expect(isComponentError(error)).toBe(false);
    });

    it("should correctly identify EffectError", () => {
      const error = createReactError("EffectError", "Effect failed");
      expect(isEffectError(error)).toBe(true);
    });

    it("should correctly identify EventHandlerError", () => {
      const error = createReactError("EventHandlerError", "Handler failed");
      expect(isEventHandlerError(error)).toBe(true);
    });

    it("should correctly identify FormSubmissionError", () => {
      const error = createReactError("FormSubmissionError", "Form failed", {
        fieldErrors: { email: ["Invalid email"] },
      });
      expect(isFormSubmissionError(error)).toBe(true);
    });

    it("should correctly identify ValidationError", () => {
      const error = createReactError("ValidationError", "Validation failed", {
        field: "email",
        value: "invalid",
      });
      expect(isValidationError(error)).toBe(true);
    });

    it("should correctly identify AsyncComponentError", () => {
      const error = createReactError("AsyncComponentError", "Async failed");
      expect(isAsyncComponentError(error)).toBe(true);
    });

    it("should correctly identify StateUpdateError", () => {
      const error = createReactError("StateUpdateError", "State update failed");
      expect(isStateUpdateError(error)).toBe(true);
    });

    it("should correctly identify AbortedError", () => {
      const error = createReactError("ABORTED", "Operation aborted", {
        reason: "manual_abort",
      });
      expect(isAbortedError(error)).toBe(true);
    });

    it("should correctly identify ComponentUnmountedError", () => {
      const error = createReactError(
        "COMPONENT_UNMOUNTED",
        "Component unmounted"
      );
      expect(isComponentUnmountedError(error)).toBe(true);
    });

    it("should correctly identify UnexpectedError", () => {
      const error = createReactError("UNEXPECTED_ERROR", "Unexpected error");
      expect(isUnexpectedError(error)).toBe(true);
    });
  });

  describe("isReactError", () => {
    it("should return true for any React error type", () => {
      const errors = [
        createReactError("ComponentError", "Test"),
        createReactError("RenderError", "Test"),
        createReactError("EffectError", "Test"),
        createReactError("EventHandlerError", "Test"),
        createReactError("FormSubmissionError", "Test"),
        createReactError("ValidationError", "Test"),
        createReactError("AsyncComponentError", "Test"),
        createReactError("StateUpdateError", "Test"),
        createReactError("ABORTED", "Test"),
        createReactError("COMPONENT_UNMOUNTED", "Test"),
        createReactError("UNEXPECTED_ERROR", "Test"),
      ];

      errors.forEach((error) => {
        expect(isReactError(error)).toBe(true);
      });
    });

    it("should return false for non-React errors", () => {
      const error = createError({
        type: "CustomError",
        message: "Not a React error",
      });
      expect(isReactError(error)).toBe(false);
    });
  });

  describe("hasFieldErrors", () => {
    it("should return true for FormSubmissionError with field errors", () => {
      const error = createReactError("FormSubmissionError", "Form failed", {
        fieldErrors: { email: ["Invalid"] },
      });
      expect(hasFieldErrors(error)).toBe(true);
    });

    it("should return true for ValidationError with field", () => {
      const error = createReactError("ValidationError", "Invalid", {
        field: "email",
      });
      expect(hasFieldErrors(error)).toBe(true);
    });

    it("should return false for other error types", () => {
      const error = createReactError("ComponentError", "Test");
      expect(hasFieldErrors(error)).toBe(false);
    });
  });

  describe("isRetryableError", () => {
    it("should return true for retryable errors", () => {
      const errors = [
        createReactError("ComponentError", "Test"),
        createReactError("AsyncComponentError", "Test"),
        createReactError("ABORTED", "Test", { reason: "timeout" }),
      ];

      errors.forEach((error) => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it("should return false for non-retryable errors", () => {
      const errors = [
        createReactError("ValidationError", "Test"),
        createReactError("COMPONENT_UNMOUNTED", "Test"),
        createReactError("ABORTED", "Test", { reason: "unmount" }),
      ];

      errors.forEach((error) => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe("getComponentName", () => {
    it("should return component name if present", () => {
      const error = createReactError("ComponentError", "Test", {
        componentName: "MyComponent",
      });
      expect(getComponentName(error)).toBe("MyComponent");
    });

    it("should return undefined if not present", () => {
      const error = createReactError("ComponentError", "Test");
      expect(getComponentName(error)).toBeUndefined();
    });

    it("should return undefined for non-React errors", () => {
      expect(getComponentName(new Error("Test"))).toBeUndefined();
    });
  });

  describe("getFieldErrors", () => {
    it("should return field errors from FormSubmissionError", () => {
      const fieldErrors = { email: ["Invalid"], name: ["Required"] };
      const error = createReactError("FormSubmissionError", "Test", {
        fieldErrors,
      });
      expect(getFieldErrors(error)).toEqual(fieldErrors);
    });

    it("should return field errors from ValidationError", () => {
      const error = createReactError("ValidationError", "Invalid email", {
        field: "email",
      });
      expect(getFieldErrors(error)).toEqual({ email: ["Invalid email"] });
    });

    it("should return undefined for other errors", () => {
      const error = createReactError("ComponentError", "Test");
      expect(getFieldErrors(error)).toBeUndefined();
    });
  });

  describe("isErrorFromComponent", () => {
    it("should return true if error is from specified component", () => {
      const error = createReactError("ComponentError", "Test", {
        componentName: "MyComponent",
      });
      expect(isErrorFromComponent(error, "MyComponent")).toBe(true);
    });

    it("should return false if error is from different component", () => {
      const error = createReactError("ComponentError", "Test", {
        componentName: "OtherComponent",
      });
      expect(isErrorFromComponent(error, "MyComponent")).toBe(false);
    });

    it("should return false for non-React errors", () => {
      expect(isErrorFromComponent(new Error("Test"), "MyComponent")).toBe(
        false
      );
    });
  });

  describe("State type guards", () => {
    describe("isTryState", () => {
      it("should return true for valid TryState", () => {
        const state: TryState<string> = {
          data: "test",
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        };
        expect(isTryState(state)).toBe(true);
      });

      it("should return false for invalid objects", () => {
        expect(isTryState({})).toBe(false);
        expect(isTryState({ data: "test" })).toBe(false);
        expect(isTryState(null)).toBe(false);
        expect(isTryState("string")).toBe(false);
      });
    });

    describe("isRetryableTryState", () => {
      it("should return true for valid RetryableTryState", () => {
        const state: RetryableTryState<string> = {
          data: null,
          error: null,
          isLoading: false,
          isSuccess: false,
          isError: false,
          retryCount: 0,
          isRetrying: false,
          maxRetriesReached: false,
        };
        expect(isRetryableTryState(state)).toBe(true);
      });

      it("should return false for regular TryState", () => {
        const state: TryState<string> = {
          data: "test",
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        };
        expect(isRetryableTryState(state)).toBe(false);
      });
    });

    describe("isFormTryState", () => {
      it("should return true for valid FormTryState", () => {
        const state: FormTryState<any> = {
          data: null,
          error: null,
          isLoading: false,
          isSuccess: false,
          isError: false,
          fieldErrors: {},
          isValidating: false,
          isValid: true,
          isDirty: false,
          isSubmitted: false,
        };
        expect(isFormTryState(state)).toBe(true);
      });

      it("should return false for regular TryState", () => {
        const state: TryState<string> = {
          data: "test",
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        };
        expect(isFormTryState(state)).toBe(false);
      });
    });
  });
});
