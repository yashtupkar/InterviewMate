import React from 'react';

const Background = () => {
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden w-full">
      {/* Background Image - Native Lazy Loading */}
      <img 
        src="/assets/background/Landing-bg.png" 
        loading="lazy" 
        className="absolute inset-0 w-full h-full object-fit"
        alt=""
        aria-hidden="true"
      />
      
      {/* Maintain a dark overlay if needed for readability, but user showed preference for less overlays */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};

export default Background;
