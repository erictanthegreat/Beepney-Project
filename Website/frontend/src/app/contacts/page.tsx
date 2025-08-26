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
  address?: string;
  created_at: string;
}

type NewHotline = {
  name: string;
  number: string;
  address?: string;
};

const contactSections = [
  { key: 'Ambulance', label: 'Ambulance' },
  { key: 'Police', label: 'Police Station' },
  { key: 'LTFRB', label: 'LTFRB' },
];

// Format Philippine numbers to +63XXX-XXX-YYYY
const formatPHNumber = (num: string): string => {
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('63') && digits.length === 12) {
    return `+63${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+63${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return num;
};

const ContactsPage: React.FC = () => {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [editingHotline, setEditingHotline] = useState<Hotline | null>(null);

  useEffect(() => {
    fetchHotlines();
  }, []);

  const fetchHotlines = async () => {
    const { data, error } = await supabase.from<'hotlines', Hotline>('hotlines').select('*');
    if (error) console.error('Error fetching hotlines:', error.message);
    else setHotlines(data || []);
  };

  const openOverlay = (section: string) => {
    setSelectedSection(section);
    setEditingHotline(null);
    setIsOverlayOpen(true);
  };

  const handleEditHotline = (hotline: Hotline) => {
    setEditingHotline(hotline);
    setSelectedSection(hotline.section);
    setIsOverlayOpen(true);
  };

  const handleSaveHotline = async (hotlineData: NewHotline) => {
    if (editingHotline) {
      const { data, error } = await supabase
        .from('hotlines')
        .update(hotlineData)
        .eq('id', editingHotline.id)
        .select();

      if (error) console.error('Error updating hotline:', error.message);
      else setHotlines((prev) => prev.map(h => h.id === editingHotline.id ? data![0] : h));
    } else {
      const { data, error } = await supabase
        .from('hotlines')
        .insert([{ section: selectedSection, ...hotlineData }])
        .select();

      if (error) console.error('Error adding hotline:', error.message);
      else setHotlines((prev) => [...prev, ...(data || [])]);
    }

    setIsOverlayOpen(false);
    setEditingHotline(null);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {contactSections.map(({ key, label }) => {
          const sectionHotlines = hotlines.filter((h) => h.section === key);

          return (
            <div key={key}>
              <h2 className="text-[32px] sm:text-[40px] font-bold text-[#073051] mb-6">
                {label}
              </h2>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                style={{ gridAutoRows: '1fr' }}
              >
                {sectionHotlines.map((h, idx) => (
                  <div
                    key={h.id}
                    className="border border-[#D1D1D1] rounded-[15px] flex items-start p-4 gap-3 cursor-pointer hover:bg-gray-200 transition w-full h-full min-h-[100px]"
                    onClick={() => handleEditHotline(h)}
                  >
                    <div className="w-3 h-3 mt-1 rounded-full bg-[#1E86DA] flex-shrink-0" />

                    <div className="flex flex-col">
                      <h3 className="font-semibold text-[#000000] text-lg">
                        {key} Hotline {idx + 1}{' '}
                        <span className="text-[#595959] font-normal">("{h.name}")</span>
                      </h3>

                      <p className="text-[#0F76C2] text-sm">{formatPHNumber(h.number)}</p>

                      {h.address && <p className="text-[#9A9A9A] text-sm">{h.address}</p>}
                    </div>
                  </div>
                ))}

                <div
                  className="border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200 group w-full h-full min-h-[100px]"
                  onClick={() => openOverlay(key)}
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
        onClose={() => {
          setIsOverlayOpen(false);
          setEditingHotline(null);
        }}
        sectionName={selectedSection}
        onSave={handleSaveHotline}
        initialData={editingHotline || undefined}
      />
    </>
  );
};

export default ContactsPage;