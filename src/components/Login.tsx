import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Trophy } from "lucide-react";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in!");
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
          toast.error("Popup was closed before login could finish.");
      } else if (error.code === 'auth/unauthorized-domain') {
          toast.error("Domain is not authorized for OAuth. Please add it in Firebase Console.");
      } else {
          toast.error(error?.message || "Failed to login. Please ensure Google Auth is enabled.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 rotate-12 shadow-2xl shadow-amber-500/20">
        <Trophy className="w-10 h-10 text-black -rotate-12" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">MINTLY PRO</h1>
      <p className="text-zinc-400 mb-8 max-w-sm text-center">
        Login to start earning balance, claiming daily rewards, and tracking your rank on the leaderboard.
      </p>
      
      <Button 
        onClick={handleGoogleLogin} 
        disabled={isLoading}
        className="w-full max-w-sm h-14 bg-white hover:bg-zinc-200 text-black font-bold text-base rounded-xl flex items-center justify-center gap-3 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>

      <p className="mt-8 text-xs text-zinc-600 max-w-xs text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
