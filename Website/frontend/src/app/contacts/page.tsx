'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '../../components/ui/header';
import Overlay from '../../components/ui/overlay';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Hotline {
  id: string;
  section: string;
  name: string;
  number: string;
  created_at: string;
}

type NewHotline = {
  name: string;
  number: string;
};

const contactSections = ['Ambulance', 'Police Station', 'LTFRB', 'Others'];

// ✅ Format Philippine numbers to +63XXX-XXX-YYYY
const formatPHNumber = (num: string): string => {
  const digits = num.replace(/\D/g, '');

  // Ensure it starts with country code +63
  if (digits.startsWith('63') && digits.length === 12) {
    // +63 + 10 digits (mobile)
    return `+63${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }

  // Handle raw 10-digit numbers that might not yet have +63
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+63${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Landline: +63 + area code + 7 digits
  if (digits.startsWith('63') && digits.length === 11) {
    return `+63${digits.slice(2, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return num;
};

const ContactsPage: React.FC = () => {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchHotlines();
  }, []);

  const fetchHotlines = async () => {
    const { data, error } = await supabase.from<'hotlines', Hotline>('hotlines').select('*');
    if (error) {
      console.error('Error fetching hotlines:', error.message);
    } else {
      setHotlines(data || []);
    }
  };

  const openOverlay = (section: string) => {
    setSelectedSection(section);
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  const handleAddHotline = async (hotline: NewHotline) => {
    const { data, error } = await supabase
      .from('hotlines')
      .insert([{ section: selectedSection, ...hotline }])
      .select();

    if (error) {
      console.error('Error adding hotline:', error.message);
    } else {
      setHotlines((prev) => [...prev, ...(data || [])]);
      closeOverlay();
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {contactSections.map((section) => {
          const sectionHotlines = hotlines.filter((h) => h.section === section);

          return (
            <div key={section}>
              <h2 className="text-[32px] sm:text-[40px] font-bold text-[#073051] mb-6">
                {section}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {sectionHotlines.map((h) => (
                  <div
                    key={h.id}
                    className="w-[352px] h-[82px] border border-[#D1D1D1] rounded-[15px] flex items-start space-x-3 p-4"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#1E86DA] mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-[#073051] text-lg">{h.name}</h3>
                      <p className="text-[#9A9A9A] text-sm">{formatPHNumber(h.number)}</p>
                    </div>
                  </div>
                ))}

                {/* Add button */}
                <div
                  className="w-[352px] h-[82px] border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer
                  hover:bg-[#D1D1D1] transition-colors duration-200 group"
                  onClick={() => openOverlay(section)}
                >
                  <button className="text-[#CBCBCB] group-hover:text-[#6B6B6B] transition-colors duration-200">
                    <PlusIcon className="h-7 w-7" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <Overlay
        isOpen={isOverlayOpen}
        onClose={closeOverlay}
        sectionName={selectedSection}
        onSave={handleAddHotline}
      />
    </>
  );
};

export default ContactsPage;