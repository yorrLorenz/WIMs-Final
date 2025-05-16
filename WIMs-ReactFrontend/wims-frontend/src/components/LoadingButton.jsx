
import React from "react";

const LoadingButton = ({ isLoading, onClick, children, ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
      {...props}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );
};

export default LoadingButton;
