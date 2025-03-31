import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "../apiClient";
import Button from "../components/Button";
import LoginHeader from "../components/Header";
import InputField from "../components/Input";
import LoginFormContainer from "../components/LoginFormContainer";

// Base schema for individual field validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const confirmPasswordSchema = z.string().min(1, "Please confirm your password");

// Complete schema with refinement for form validation
const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference from the Zod schema
type SignupFormData = z.infer<typeof signupSchema>;
type SignupFormErrors = Partial<Record<keyof SignupFormData, string>>;

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [id]: undefined }));
    
    // For password confirmation, validate match on every change
    if (id === "confirmPassword" || id === "password") {
      if (id === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords don't match" }));
      } else if (id === "confirmPassword" && value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords don't match" }));
      } else if (id === "confirmPassword" && value === formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleBlur = (field: keyof SignupFormData) => {
    try {
      // For confirm password, we need to check the refinement
      if (field === "confirmPassword") {
        if (formData.password !== formData.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: "Passwords don't match" }));
          return;
        }
        confirmPasswordSchema.parse(formData.confirmPassword);
      } else if (field === "email") {
        emailSchema.parse(formData.email);
      } else if (field === "password") {
        passwordSchema.parse(formData.password);
      }
      
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format and set the errors
        const formattedErrors: SignupFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = formData;
      await apiClient.post("/users/register", signupData);
      
      // Show success message before redirecting
      navigate("/login", { 
        state: { message: "Account created successfully! Please log in." } 
      });
    } catch (err: any) {
      // Detailed API error handling
      if (err.response) {
        if (err.response.status === 409) {
          setApiError("This email is already registered. Please try another one.");
        } else if (err.response.data?.field) {
          // Field-specific error from server
          setErrors((prev) => ({ 
            ...prev, 
            [err.response.data.field]: err.response.data.message
          }));
        } else {
          setApiError(err.response.data?.message || `Registration failed (${err.response.status})`);
        }
      } else if (err.request) {
        setApiError("No response from server. Please check your internet connection.");
      } else {
        setApiError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer>
      <LoginHeader title="Create an Account" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <InputField
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <InputField
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <InputField
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-500 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {apiError}
          </div>
        )}

        <div className="text-xs text-gray-600 mb-4">
          <p>Password must:</p>
          <ul className="list-disc pl-5 mt-1">
            <li className={formData.password.length >= 6 ? "text-green-600" : ""}>
              Be at least 6 characters long
            </li>
            <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
              Contain at least one uppercase letter
            </li>
            <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
              Contain at least one number
            </li>
          </ul>
        </div>

        <Button
          text={loading ? "Creating account..." : "Sign Up"}
          type="submit"
          disabled={loading}
        />
      </form>
      <p className="text-sm pt-6 text-center text-gray-800">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </LoginFormContainer>
  );
};

export default SignupForm;