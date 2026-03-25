import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ResumeProvider } from "./context/ResumeContext";
import "./index.css";
import { dark } from "@clerk/themes";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppProvider>
          <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY} 
            afterSignOutUrl="/"
            signInUrl="/signin"
            signUpUrl="/signup"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#bef264",
                colorBackground: "#18181b",
                colorInputBackground: "#27272a",
                colorInputText: "white",
              }
            }}
          >
            <ResumeProvider>
              <App />
            </ResumeProvider>
          </ClerkProvider>
        </AppProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
