import { SignUp } from "@clerk/clerk-react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import Aurora from "../reactbits/Aurora";

const SignUpPage = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6 relative">
            <div className="fixed inset-0 z-[-10] pointer-events-none ">
              <div className="absolute inset-0 opacity-80">
                <Aurora
                  colorStops={["#00f5a0", "#7af298", "#00d9ff"]}
                  amplitude={1.0}
                  speed={0.5}
                />
              </div>
            </div>
      
      <div className="absolute top-8 left-8 z-20">
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-[#bef264] transition-colors font-black uppercase tracking-widest text-[10px]">
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="auth-card-container animate-fade w-full max-w-[440px]">
        {/* <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Get <span className="text-[#bef264]">Started</span>.</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Create your prep account</p>
        </div> */}
        
        <SignUp 
          routing="path"
          path="/signup"
          signInUrl="/signin"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
