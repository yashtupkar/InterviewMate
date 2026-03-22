import React from 'react';

const Background = () => {
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-background w-full">
      {/* Static CSS gradient — always visible on all screens as the base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 70% at 5% 0%, rgba(0, 245, 159, 0.50) 0%, transparent 65%),' +
            'radial-gradient(ellipse 90% 60% at 95% 5%, rgba(0, 217, 255, 0.38) 0%, transparent 60%),' +
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(122, 242, 152, 0.45) 0%, transparent 55%)',
        }}
      />

      {/* Bottom dark fade — always visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808]" />
    </div>
  );
};

export default Background;
