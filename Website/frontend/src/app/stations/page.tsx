'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../../components/ui/header';
import { MapPinIcon } from '@heroicons/react/24/outline';

const StationsPage = () => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      <Header ref={headerRef} />
      <main className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[${headerHeight}px] left-0 w-[350px] h-full border-r border-[#D1D1D1] p-6 flex flex-col items-center justify-center z-10`}
        >
          <MapPinIcon className="h-[150px] w-[150px] text-[#1E86DA] mb-4" />

          <p className="text-center text-[20px] text-[#737F83]">
            Click anywhere to put a station location or click a station to edit.
          </p>
        </aside>

        {/* Map */}
        <div className="ml-[350px] p-6 flex-1">
          <h1 className="text-2xl font-semibold">Map showcase</h1>
          {/* The Mapbox component or other content will go here */}
        </div>
      </main>
    </>
  );
};

export default StationsPage;