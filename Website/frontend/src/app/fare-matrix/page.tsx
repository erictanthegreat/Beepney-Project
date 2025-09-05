'use client';

import React from 'react';
import Header from '../../components/ui/header';
import { PlusIcon } from '@heroicons/react/24/outline';

const fareSections = [
  { key: 'PUB', label: 'PUB City & Provincial' },
  { key: 'PUJ', label: 'PUJ' },
  { key: 'Others', label: 'Others' },
];

const FareMatrixPage: React.FC = () => {
  const handleAddFare = (section: string) => {
    alert(`Add new fare for ${section} (placeholder)`);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {fareSections.map(({ key, label }) => (
          <div key={key}>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#073051] mb-6">
              {label}
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
              style={{ gridAutoRows: '1fr' }}
            >
              <div
                className="border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 group w-full h-full min-h-[100px]"
                onClick={() => handleAddFare(key)}
              >
                <button className="text-[#CBCBCB] group-hover:text-[#6B6B6B] transition-colors duration-200">
                  <PlusIcon className="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
};

export default FareMatrixPage;