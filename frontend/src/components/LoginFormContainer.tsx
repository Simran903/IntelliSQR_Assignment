import React, { FC } from 'react';

interface LoginFormContainerProps {
  children: React.ReactNode;
}

const LoginFormContainer: FC<LoginFormContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
};

export default LoginFormContainer;