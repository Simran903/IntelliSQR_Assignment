import { FC } from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button: FC<ButtonProps> = ({
  text,
  onClick,
  type = "button"
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-indigo-900 text-white py-3 rounded-md hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 cursor-pointer"
    >
      {text}
    </button>
  );
};

export default Button;