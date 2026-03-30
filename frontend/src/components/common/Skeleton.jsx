import React from "react";

/**
 * Premium Skeleton Loader Component
 * Supports glassmorphism and shimmer effects
 */
const Skeleton = ({ className = "", variant = "rect", shimmer = true }) => {
  const baseClasses = "relative overflow-hidden bg-white/5 border border-white/5";
  const roundedClasses = variant === "circle" ? "rounded-full" : "rounded-xl";
  const shimmerClasses = shimmer ? "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent" : "";

  return (
    <div className={`${baseClasses} ${roundedClasses} ${shimmerClasses} ${className}`}>
      {/* Required for the shimmer animation to be defined if not already present in the parent page */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
};

export default Skeleton;
