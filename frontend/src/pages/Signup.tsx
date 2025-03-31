import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "../apiClient";
import Button from "../components/Button";
import LoginHeader from "../components/Header";
import InputField from "../components/Input";
import LoginFormContainer from "../components/LoginFormContainer";

// Zod Schema for validation
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.id]: undefined })); // Clear field-specific errors
  };

  const validateForm = () => {
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors({
        email: formattedErrors.email?._errors[0],
        password: formattedErrors.password?._errors[0],
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await apiClient.post("/users/register", formData);
      navigate("/login"); // Redirect after successful signup
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer>
      <LoginHeader title="Create an Account" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}

        <div className="relative">
          <InputField
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500">{errors.password}</p>}

        {apiError && <p className="text-red-600">{apiError}</p>}

        <Button text={loading ? "Signing up..." : "Sign Up"} type="submit" disabled={loading} />
      </form>
      <p className="text-sm pt-6 text-center text-gray-800">
        Already have an account? <a href="/login">Login</a>
      </p>
    </LoginFormContainer>
  );
};

export default SignupForm;
