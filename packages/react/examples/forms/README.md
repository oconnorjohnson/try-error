# Forms Examples

This directory contains examples demonstrating form validation and error handling patterns using try-error in React applications.

## Examples

### ValidationForm.tsx

A comprehensive registration form that demonstrates:

- Real-time field validation with try-error
- Custom validation error types using `createValidationError`
- Form-wide validation on submit using `tryAll`
- Error state management and display
- Type-safe validation functions

**Key Features:**

- Individual field validation with immediate feedback
- Password strength validation with detailed requirements
- Email format validation with regex patterns
- Age validation with range checking
- Terms acceptance validation
- Form submission with simulated API calls

## Form Validation Patterns

### 1. Field-Level Validation

```tsx
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
```

### 2. Real-Time Validation

```tsx
const handleFieldChange = (field: keyof FormData, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  // Debounced validation to avoid excessive calls
  setTimeout(() => validateField(field, value), 300);
};

const validateField = (field: keyof FormData, value: any) => {
  const result = validateEmail(value); // or other validators

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
```

### 3. Form-Wide Validation

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate all fields at once
  const validationResult = tryAll([
    () => validateEmail(formData.email),
    () => validatePassword(formData.password),
    () => validateConfirmPassword(formData.password, formData.confirmPassword),
    () => validateAge(formData.age),
    () => validateTerms(formData.terms),
  ]);

  if (isTryError(validationResult)) {
    // Handle validation errors
    collectAndDisplayErrors();
    return;
  }

  // Proceed with form submission
  await submitForm();
};
```

### 4. Error Display and UX

```tsx
const getFieldClassName = (field: keyof FormData) => {
  const baseClass =
    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
  const errorClass = fieldErrors[field]
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-blue-500";
  return `${baseClass} ${errorClass}`;
};

// Error message display
{
  fieldErrors.email && (
    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
  );
}
```

## Validation Types

### Required Field Validation

```tsx
if (!value.trim()) {
  throw createValidationError("REQUIRED_FIELD", "This field is required", {
    field,
  });
}
```

### Format Validation

```tsx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw createValidationError(
    "INVALID_FORMAT",
    "Please enter a valid email address",
    { field: "email" }
  );
}
```

### Range Validation

```tsx
if (age < 13) {
  throw createValidationError(
    "TOO_YOUNG",
    "You must be at least 13 years old",
    { field: "age" }
  );
}
```

### Cross-Field Validation

```tsx
if (password !== confirmPassword) {
  throw createValidationError("PASSWORDS_MISMATCH", "Passwords do not match", {
    field: "confirmPassword",
  });
}
```

### Complex Business Rules

```tsx
if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
  throw createValidationError(
    "WEAK_PASSWORD",
    "Password must contain uppercase, lowercase, and number",
    { field: "password" }
  );
}
```

## Error State Management

### Field-Level Errors

```tsx
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

// Update specific field error
setFieldErrors((prev) => ({
  ...prev,
  [fieldName]: errorMessage,
}));

// Clear specific field error
setFieldErrors((prev) => {
  const newErrors = { ...prev };
  delete newErrors[fieldName];
  return newErrors;
});
```

### Form-Level Errors

```tsx
const [submitError, setSubmitError] = useState<string | null>(null);

// Display form-wide error
if (hasValidationErrors) {
  setSubmitError("Please fix the validation errors above");
}
```

### Success States

```tsx
const [submitSuccess, setSubmitSuccess] = useState(false);

// Show success message
setSubmitSuccess(true);
setTimeout(() => setSubmitSuccess(false), 5000); // Auto-hide
```

## Best Practices

### 1. Validation Timing

- **On Change**: For immediate feedback (with debouncing)
- **On Blur**: For less intrusive validation
- **On Submit**: Always validate everything before submission

### 2. Error Messages

- Be specific and actionable
- Use consistent language and tone
- Provide examples when helpful
- Consider internationalization

### 3. User Experience

- Show validation state visually (colors, icons)
- Disable submit button when form is invalid
- Provide loading states during submission
- Clear errors when user starts fixing them

### 4. Performance

- Debounce real-time validation
- Avoid validating on every keystroke
- Use `tryAll` for efficient batch validation
- Cache validation results when appropriate

## Advanced Patterns

### Async Validation

```tsx
const validateEmailUnique = async (email: string) => {
  return await tryAsync(async () => {
    const response = await fetch(`/api/check-email?email=${email}`);
    if (!response.ok) {
      throw createValidationError("SERVER_ERROR", "Unable to validate email");
    }

    const { exists } = await response.json();
    if (exists) {
      throw createValidationError(
        "EMAIL_EXISTS",
        "This email is already registered"
      );
    }

    return email;
  });
};
```

### Conditional Validation

```tsx
const validateBusinessInfo = (userType: string, businessName: string) => {
  return trySync(() => {
    if (userType === "business" && !businessName.trim()) {
      throw createValidationError(
        "REQUIRED_FIELD",
        "Business name is required for business accounts"
      );
    }
    return businessName;
  });
};
```

### Schema-Based Validation

```tsx
interface ValidationSchema {
  [field: string]: (
    value: any,
    formData: FormData
  ) => TryResult<any, ValidationError>;
}

const schema: ValidationSchema = {
  email: (value) => validateEmail(value),
  password: (value) => validatePassword(value),
  confirmPassword: (value, formData) =>
    validateConfirmPassword(formData.password, value),
};

const validateForm = (formData: FormData) => {
  const results = Object.entries(schema).map(([field, validator]) =>
    validator(formData[field], formData)
  );

  return tryAll(results);
};
```

## Integration with Form Libraries

### React Hook Form

```tsx
import { useForm } from "react-hook-form";

const {
  register,
  handleSubmit,
  setError,
  formState: { errors },
} = useForm();

const onSubmit = (data) => {
  const result = validateEmail(data.email);
  if (isTryError(result)) {
    setError("email", { message: result.message });
    return;
  }
  // Continue with submission
};
```

### Formik

```tsx
import { Formik } from "formik";

const validate = (values) => {
  const errors = {};

  const emailResult = validateEmail(values.email);
  if (isTryError(emailResult)) {
    errors.email = emailResult.message;
  }

  return errors;
};
```

## Testing Form Validation

### Unit Testing Validators

```tsx
import { validateEmail } from "./validators";

test("validates email format", () => {
  const result = validateEmail("invalid-email");
  expect(isTryError(result)).toBe(true);
  expect(result.type).toBe("INVALID_FORMAT");
});

test("accepts valid email", () => {
  const result = validateEmail("user@example.com");
  expect(isTryError(result)).toBe(false);
  expect(result).toBe("user@example.com");
});
```

### Integration Testing

```tsx
import { render, fireEvent, waitFor } from "@testing-library/react";

test("shows validation error on invalid input", async () => {
  const { getByLabelText, getByText } = render(<ValidationForm />);

  const emailInput = getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: "invalid" } });

  await waitFor(() => {
    expect(getByText(/please enter a valid email/i)).toBeInTheDocument();
  });
});
```
