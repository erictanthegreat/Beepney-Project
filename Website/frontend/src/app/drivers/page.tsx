'use client';

import React from 'react';
import Header from '../../components/ui/header';

const DriversPage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        {/* Drivers: add text here */}
        {/* https://ui.shadcn.com/docs/components/data-table */}
      </main>
    </>
  );
};

export default DriversPage;