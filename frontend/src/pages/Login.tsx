import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "../apiClient";
import Button from "../components/Button";
import LoginHeader from "../components/Header";
import InputField from "../components/Input";
import LoginFormContainer from "../components/LoginFormContainer";

// Individual field schemas for validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters");

// Combined schema for form validation
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Type inference from the Zod schema
type LoginFormData = z.infer<typeof loginSchema>;
type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleBlur = (field: keyof LoginFormData) => {
    try {
      if (field === "email") {
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
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format and set the errors
        const formattedErrors: LoginFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
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
      const response = await apiClient.post("/users/login", formData);
      
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: any) {
      // More detailed API error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setApiError("Invalid email or password");
        } else if (err.response.status === 429) {
          setApiError("Too many login attempts. Please try again later.");
        } else {
          setApiError(err.response.data?.message || `Server error (${err.response.status})`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setApiError("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setApiError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer>
      <LoginHeader title="Welcome back!" />
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

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {apiError}
          </div>
        )}

        <Button
          text={loading ? "Logging in..." : "Login"}
          type="submit"
          disabled={loading}
        />
      </form>

      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <p className="text-sm pt-6 text-center text-gray-800">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </LoginFormContainer>
  );
};

export default LoginForm;