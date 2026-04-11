import React from 'react';

export const AnimatedButton = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <button className={`animated-action-btn ${className}`}>
      {text}
      <div className="arrow-wrapper">
        <div className="arrow" />
      </div>
    </button>
  );
}

export const AnimatedSignInButton = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <button className={`animated-signin-btn ${className}`}>
      {text}
      <div className="arrow-wrapper">
        <div className="arrow" />
      </div>
    </button>
  );
}
