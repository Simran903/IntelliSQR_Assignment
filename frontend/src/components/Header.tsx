import { FC } from 'react';

interface LoginHeaderProps {
  title: string;
}

const LoginHeader: FC<LoginHeaderProps> = ({ title }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold text-gray-800 inline-block px-4 py-2">
        {title}
      </h1>
    </div>
  );
};

export default LoginHeader;