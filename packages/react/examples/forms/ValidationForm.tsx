import React, { useState } from "react";
import { trySync, isTryError, createValidationError, tryAll } from "try-error";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  terms: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

// Validation functions using try-error
const validateEmail = (email: string) => {
  return trySync(() => {
    if (!email.trim()) {
      throw createValidationError("REQUIRED_FIELD", "Email is required", {
        field: "email",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createValidationError(
        "INVALID_FORMAT",
        "Please enter a valid email address",
        { field: "email" }
      );
    }

    return email.toLowerCase().trim();
  });
};

const validatePassword = (password: string) => {
  return trySync(() => {
    if (!password) {
      throw createValidationError("REQUIRED_FIELD", "Password is required", {
        field: "password",
      });
    }

    if (password.length < 8) {
      throw createValidationError(
        "TOO_SHORT",
        "Password must be at least 8 characters long",
        { field: "password" }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw createValidationError(
        "WEAK_PASSWORD",
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        { field: "password" }
      );
    }

    return password;
  });
};

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  return trySync(() => {
    if (!confirmPassword) {
      throw createValidationError(
        "REQUIRED_FIELD",
        "Please confirm your password",
        { field: "confirmPassword" }
      );
    }

    if (password !== confirmPassword) {
      throw createValidationError(
        "PASSWORDS_MISMATCH",
        "Passwords do not match",
        { field: "confirmPassword" }
      );
    }

    return confirmPassword;
  });
};

const validateAge = (age: string) => {
  return trySync(() => {
    if (!age.trim()) {
      throw createValidationError("REQUIRED_FIELD", "Age is required", {
        field: "age",
      });
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) {
      throw createValidationError("INVALID_FORMAT", "Age must be a number", {
        field: "age",
      });
    }

    if (ageNum < 13) {
      throw createValidationError(
        "TOO_YOUNG",
        "You must be at least 13 years old",
        { field: "age" }
      );
    }

    if (ageNum > 120) {
      throw createValidationError("INVALID_AGE", "Please enter a valid age", {
        field: "age",
      });
    }

    return ageNum;
  });
};

const validateTerms = (terms: boolean) => {
  return trySync(() => {
    if (!terms) {
      throw createValidationError(
        "REQUIRED_FIELD",
        "You must accept the terms and conditions",
        { field: "terms" }
      );
    }

    return terms;
  });
};

export function ValidationForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    terms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Real-time field validation
  const validateField = (field: keyof FormData, value: any) => {
    let result;

    switch (field) {
      case "email":
        result = validateEmail(value);
        break;
      case "password":
        result = validatePassword(value);
        break;
      case "confirmPassword":
        result = validateConfirmPassword(formData.password, value);
        break;
      case "age":
        result = validateAge(value);
        break;
      case "terms":
        result = validateTerms(value);
        break;
      default:
        return;
    }

    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (isTryError(result)) {
        newErrors[field] = result.message;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate field after a short delay to avoid excessive validation
    setTimeout(() => validateField(field, value), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate all fields at once
    const validationResult = tryAll([
      () => validateEmail(formData.email),
      () => validatePassword(formData.password),
      () =>
        validateConfirmPassword(formData.password, formData.confirmPassword),
      () => validateAge(formData.age),
      () => validateTerms(formData.terms),
    ]);

    if (isTryError(validationResult)) {
      // Collect all validation errors
      const errors: Record<string, string> = {};

      // For demonstration, we'll extract field errors from the validation result
      // In a real app, you might want to validate each field individually to get all errors
      [
        validateEmail(formData.email),
        validatePassword(formData.password),
        validateConfirmPassword(formData.password, formData.confirmPassword),
        validateAge(formData.age),
        validateTerms(formData.terms),
      ].forEach((result) => {
        if (isTryError(result) && result.context?.field) {
          errors[result.context.field] = result.message;
        }
      });

      setFieldErrors(errors);
      setSubmitError("Please fix the validation errors above");
      setIsSubmitting(false);
      return;
    }

    // Simulate API submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate occasional server errors
      if (Math.random() < 0.3) {
        throw new Error("Server error: Unable to create account");
      }

      setSubmitSuccess(true);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        terms: false,
      });
      setFieldErrors({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (field: keyof FormData) => {
    const baseClass =
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
    const errorClass = fieldErrors[field]
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:ring-blue-500";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Registration Form</h2>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ Account created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            className={getFieldClassName("email")}
            placeholder="Enter your email"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            className={getFieldClassName("password")}
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleFieldChange("confirmPassword", e.target.value)
            }
            className={getFieldClassName("confirmPassword")}
            placeholder="Confirm your password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Age Field */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Age *
          </label>
          <input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleFieldChange("age", e.target.value)}
            className={getFieldClassName("age")}
            placeholder="Enter your age"
            min="13"
            max="120"
          />
          {fieldErrors.age && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.terms}
              onChange={(e) => handleFieldChange("terms", e.target.checked)}
              className="mt-1 mr-2"
            />
            <span className="text-sm text-gray-700">
              I accept the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                terms and conditions
              </a>{" "}
              *
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(fieldErrors).length > 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Example Info */}
      <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <p className="font-medium mb-2">This form demonstrates:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Real-time field validation with try-error</li>
          <li>Custom validation error types</li>
          <li>Form-wide validation on submit</li>
          <li>Error state management and display</li>
          <li>Type-safe validation functions</li>
        </ul>
      </div>
    </div>
  );
}
