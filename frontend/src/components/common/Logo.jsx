import React from 'react';

const Logo = ({ size = 32, className = "" }) => {
  return (
    <img 
      src="/assets/logo.png" 
      alt="PlaceMateAI Logo" 
      width={size} 
      height={size} 
      className={`object-contain ${className}`}
      loading="lazy"
    />
  );
};

export default Logo;
