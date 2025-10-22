'use client';

import Image from 'next/image';

export default function ConfirmPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] px-6">
      {/* Beepney Logo */}
      <div className="mb-10">
        <Image
          src="/Beepney Logo (Website 1).svg"
          alt="Beepney Logo"
          width={400}
          height={140}
          priority
        />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#073051] mb-4">
          Thank You for Confirming!
        </h1>
        <p className="text-gray-700 mb-6 text-lg max-w-md mx-auto">
          Your Beepney account has been verified successfully.  
          You can now log in and start your journey with us.
        </p>
      </div>
    </div>
  );
}