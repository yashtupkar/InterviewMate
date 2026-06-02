import React, { lazy, Suspense } from "react";
import { FiLoader } from "react-icons/fi";

const Loadable = (Component) => (props) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
      </div>
    }
  >
    <Component {...props} />
  </Suspense>
);

export default Loadable;
