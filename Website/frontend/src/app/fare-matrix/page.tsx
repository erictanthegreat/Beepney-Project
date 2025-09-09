'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '../../components/ui/header';
import { PlusIcon } from '@heroicons/react/24/outline';
import Overlay3 from '../../components/ui/overlay3';

interface FareMatrix {
  id: string;
  section: string;
  title: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const fareSections = [
  { key: 'PUB', label: 'PUB City & Provincial' },
  { key: 'PUJ', label: 'PUJ' },
  { key: 'Others', label: 'Others' },
];

const FareMatrixPage = () => {
  const [matrices, setMatrices] = useState<FareMatrix[]>([]);
  const [role, setRole] = useState('commuter'); // track user role
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchMatrices();
    fetchRole();
  }, []);

  const fetchMatrices = async () => {
    const { data, error } = await supabase
      .from('fare_matrix')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMatrices(data);
  };

  const fetchRole = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error fetching user:', userError.message);
      return;
    }
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!error && data) setRole(data.role);
    }
  };

  // File upload handler (with title + section)
  const handleFileUpload = async ({
    file,
    title,
  }: {
    file: File;
    title: string;
  }) => {
    if (!file || !selectedSection) {
      alert('Please select a file and section.');
      return;
    }

    try {
      // Save file into beepney-bucket/fare-matrix/{section}/
      const filePath = `fare-matrix/${selectedSection}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('beepney-bucket') // ✅ bucket name
        .upload(filePath, file);

      if (uploadError) {
        alert('Error uploading file: ' + uploadError.message);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('beepney-bucket')
        .getPublicUrl(filePath);

      // Get current user (needed for uploaded_by)
      const { data: { user } } = await supabase.auth.getUser();

      // Insert metadata into table
      const { error: insertError } = await supabase.from('fare_matrix').insert([
        {
          section: selectedSection,
          title,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          uploaded_by: user?.id, // 👈 required for RLS
        },
      ]);

      if (insertError) {
        alert('Error saving metadata: ' + insertError.message);
      } else {
        fetchMatrices(); // refresh list
      }
    } catch (err) {
      console.error('Unexpected upload error:', err);
      alert('Something went wrong while uploading.');
    }

    setOverlayOpen(false);
    setSelectedSection('');
  };

  // Opens overlay for adding new fare
  const handleAddFare = (key: string) => {
    setSelectedSection(key);
    setOverlayOpen(true);
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
              {/* List uploaded fares for this section */}
              {matrices
                .filter((m) => m.section === key)
                .map((m) => (
                  <a
                    key={m.id}
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#D1D1D1] rounded-[15px] p-4 flex flex-col justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <p className="font-semibold text-[#073051] text-lg truncate">
                      {m.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {m.file_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </a>
                ))}

              {/* Add new fare (admins only) */}
              {role === 'admin' && (
                <div
                  className="border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 group w-full h-full min-h-[100px]"
                  onClick={() => handleAddFare(key)}
                >
                  <button className="text-[#CBCBCB] group-hover:text-[#6B6B6B] transition-colors duration-200">
                    <PlusIcon className="h-7 w-7" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Upload Overlay */}
      <Overlay3
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        sectionName={selectedSection}
        onSave={handleFileUpload}
      />
    </>
  );
};

export default FareMatrixPage;