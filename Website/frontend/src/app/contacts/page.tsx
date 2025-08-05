'use client';

import React from 'react';
import Header from '../../components/ui/header';

const ContactsPage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        {/* Contacts: add text here */}
      </main>
    </>
  );
};

export default ContactsPage;