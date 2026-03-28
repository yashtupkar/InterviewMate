import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Check if the URL has a hash (e.g., #testimonials)
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      // Small timeout to ensure the element is in DOM if it's dynamic
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToTop;
