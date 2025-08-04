"use client";

import React from "react";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();

  const handleUsernameLogin = () => {
    // for testing, not yet implemented backend
    alert("Username login clicked");
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    // for testing, not yet implemented backend
    alert("Google login clicked");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xs sm:max-w-sm px-4 mx-auto flex flex-col items-center">

        <div className="mb-10">
          <Image
            src="/Beepney Logo (Website 1).svg"
            alt="Beepney Logo"
            width={530}
            height={168}
            priority
          />
        </div>

        <h2 className="text-[30px] font-semibold mb-0 text-[#073051] w-full text-left">
          Login
        </h2>

        <p className="text-[16px] font-normal mt-0 mb-6 text-[#737F83] w-full text-left">
          Continue to Beepney
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border-1 border-gray-400 rounded-md placeholder-[#BABABA] text-black focus:outline-none focus:ring-0"
          style={{ borderRadius: "6px" }}
        />

        <div className="w-full mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border-1 border-gray-400 rounded-md placeholder-[#BABABA] text-black focus:outline-none focus:ring-0"
            style={{ borderRadius: "6px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#073051] focus:outline-none"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>


        <button
          onClick={handleUsernameLogin}
          className="w-full py-3 rounded-md transition mt-6"
          style={{ backgroundColor: "#1E86DA", color: "#ffffff" }}
        >
          Sign in with Username
        </button>

        <div className="flex items-center my-6 w-full">
          <hr className="flex-grow border-t border-gray-400" />
          <span className="mx-4 text-gray-400 text-[14px] font-semibold">OR</span>
          <hr className="flex-grow border-t border-gray-400" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-md transition flex items-center justify-center gap-2"
          style={{ backgroundColor: "#073051", color: "#ffffff" }}
        >
          <Image
            src="/Google Logo.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}