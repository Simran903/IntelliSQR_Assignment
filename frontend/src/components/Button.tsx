import { FC } from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ text, onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-indigo-900 text-white py-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-800"
      }`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;