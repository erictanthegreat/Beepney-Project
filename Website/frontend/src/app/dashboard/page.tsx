'use client';

import React from 'react';
import Header from '../../components/ui/header';
import { FunnelIcon, BarsArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  return (
    <>
      <Header />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Search Engine */}
          <div className="relative w-full max-w-md md:w-[320px] min-w-0">
            <input
              type="text"
              placeholder="Search here"
              className="w-full border rounded-[15px] px-4 py-2 pr-10 text-black placeholder-[#9A9A9A] border-[#D1D1D1] outline-none"
            />
            <button className="absolute inset-y-0 right-2 flex items-center justify-center text-[#073051]">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Sort & Filter */}
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <button
              className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A]
                hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
            >
              <BarsArrowDownIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Sort</span>
            </button>
            <button
              className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A]
                hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
            >
              <FunnelIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">Database</h1>

        {/* Dashboard: content goes here */}
        {/* https://ui.shadcn.com/docs/components/data-table */}
      </main>
    </>
  );
};

export default DashboardPage;