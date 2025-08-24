'use client';

import React, { useState } from 'react';
import Header from '../../components/ui/header';
import Overlay from '../../components/ui/overlay'; // Import the Overlay component
import { PlusIcon } from '@heroicons/react/24/outline';

const contactSections = ['Ambulance', 'Police Station', 'LTFRB'];

const ContactsPage = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  const openOverlay = (section: React.SetStateAction<string>) => {
    setSelectedSection(section);
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  return (
    <>
      <Header />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {contactSections.map((section) => (
          <div key={section} className="space-y-[13px]">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">{section}</h2>

            <div
              className="w-[352px] h-[82px] border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer
              hover:bg-[#D1D1D1] transition-colors duration-200 group"
              onClick={() => openOverlay(section)} // Open overlay on click
            >
              <button className="text-[#CBCBCB] group-hover:text-[#6B6B6B] transition-colors duration-200">
                <PlusIcon className="h-7 w-7" />
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Overlay Component */}
      <Overlay
        isOpen={isOverlayOpen}
        onClose={closeOverlay}
        sectionName={selectedSection}
      />
    </>
  );
};

export default ContactsPage;