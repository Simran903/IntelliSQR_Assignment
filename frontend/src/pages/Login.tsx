import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Button from "../components/Button";
import LoginHeader from "../components/Header";
import InputField from "../components/Input";
import LoginFormContainer from "../components/LoginFormContainer";

const loginSchema = z.object({
  uid: z.string().min(4, "UID must be at least 4 characters long").max(20, "UID cannot exceed 20 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[@$!%*?&]/, "Must contain at least one special character"),
});

type FormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ uid: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    try {
      loginSchema.shape[id as keyof FormData].parse(value);
      setErrors((prevErrors) => ({ ...prevErrors, [id]: undefined }));
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, [id]: (err as z.ZodError).issues[0].message }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ uid: fieldErrors.uid?.[0], password: fieldErrors.password?.[0] });
      return;
    }
    console.log("Login attempt with:", formData);
  };

  return (
    <LoginFormContainer>
      <LoginHeader title="Welcome back!" />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* UID Input */}
        <div>
          <InputField
            id="uid"
            type="text"
            placeholder="UID"
            value={formData.uid}
            onChange={handleChange}
          />
          {errors.uid && <p className="text-red-500 text-sm mt-1">{errors.uid}</p>}
        </div>

        {/* Password Input */}
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
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button text="Login" type="submit" />
      </form>
    </LoginFormContainer>
  );
};

export default LoginForm;