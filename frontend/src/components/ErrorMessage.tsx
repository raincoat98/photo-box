import React from "react";

interface ErrorMessageProps {
  message: string | null;
  show: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, show }) => {
  if (!show || !message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
      {message}
    </div>
  );
};

export default ErrorMessage;
