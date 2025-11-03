'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/ui/header';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DriverProfile {
  id: string;
  phone_number: string | null;
  full_address: string | null;
  operator_name: string | null;
  operator_number: string | null;
  operator_address: string | null;
  plate_number: string | null;
  status: string | null;
  created_at: string | null;
  profile: {
    username: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
}

const DriverProfilePage = () => {
  const { driverId } = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dropdown + state control
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverId) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('driverprofiles')
          .select(`
            id,
            phone_number,
            full_address,
            operator_name,
            operator_number,
            operator_address,
            plate_number,
            status,
            created_at,
            profiles!inner(
              username,
              email,
              role,
              avatar_url
            )
          `)
          .eq('id', driverId)
          .single();

        if (error) {
          console.error('Supabase fetch error:', error);
          setError('No driver found with the given ID.');
          setLoading(false);
          return;
        }

        const profile = Array.isArray((data as any).profiles)
          ? (data as any).profiles[0]
          : (data as any).profiles;

        setDriver({
          id: (data as any).id,
          phone_number: (data as any).phone_number ?? null,
          full_address: (data as any).full_address ?? null,
          operator_name: (data as any).operator_name ?? null,
          operator_number: (data as any).operator_number ?? null,
          operator_address: (data as any).operator_address ?? null,
          plate_number: (data as any).plate_number ?? null,
          status: (data as any).status ?? null,
          created_at: (data as any).created_at ?? null,
          profile: {
            username: profile?.username ?? 'Unknown',
            email: profile?.email ?? 'N/A',
            role: profile?.role ?? 'N/A',
            avatar_url: profile?.avatar_url ?? null,
          },
        });
        setSelectedStatus((data as any).status ?? 'pending');
      } catch (err) {
        console.error('Unexpected error fetching driver:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverId]);

  const handleBackClick = () => router.push('/drivers');

  const handleCancel = () => {
    setShowStatusMenu(false);
    setIsChanged(false);
    if (driver) setSelectedStatus(driver.status);
  };

  const handleSave = async () => {
    if (!driver) return;
    try {
      const { error } = await supabase
        .from('driverprofiles')
        .update({ status: selectedStatus })
        .eq('id', driver.id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status.');
        return;
      }

      setDriver({ ...driver, status: selectedStatus });
      setShowStatusMenu(false);
      setIsChanged(false);
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Unexpected save error:', err);
      alert('An unexpected error occurred while saving.');
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setIsChanged(true);
    setShowStatusMenu(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 mt-[50px] space-y-[25px]">
        {/* Back Button + Title */}
        <div className="flex items-center gap-6">
          <div
            onClick={handleBackClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBackClick()}
            className="flex items-center justify-center rounded-full border-2 border-[#073051] cursor-pointer
                       transition-colors duration-300 text-[#073051] hover:bg-[#073051] hover:text-white"
            style={{ width: 50, height: 50 }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </div>

          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">
            Driver&apos;s Profile Details
          </h1>
        </div>

        {/* Main Container */}
        <div
          className="bg-white rounded-[30px] border border-[#D1D1D1] w-full relative"
          style={{
            minHeight: '620px',
            padding: '3rem 3rem 6rem 3rem', // extra bottom space for button
          }}
        >
          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Loading driver details...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          )}

          {!loading && driver && (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-8 mb-10">
                {driver.profile.avatar_url ? (
                  <Image
                    src={driver.profile.avatar_url}
                    alt={driver.profile.username}
                    width={100}
                    height={100}
                    className="rounded-full object-cover border"
                  />
                ) : (
                  <Image
                    src="/Default Profile.svg"
                    alt="Default Profile"
                    width={100}
                    height={100}
                    className="rounded-full object-cover border"
                  />
                )}

                <div>
                  <h2 className="text-3xl font-semibold text-[#073051]">
                    {driver.profile.username}
                  </h2>
                  <p className="text-lg text-gray-600">{driver.profile.email}</p>

                  <div className="mt-3 flex items-center gap-2 relative">
                    <span
                      className={`inline-block px-4 py-1 rounded-full text-base font-medium ${
                        selectedStatus?.toLowerCase() === 'verified'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedStatus?.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedStatus
                        ? selectedStatus.charAt(0).toUpperCase() +
                          selectedStatus.slice(1).toLowerCase()
                        : 'N/A'}
                    </span>

                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className="text-[#073051] hover:text-[#0a4b7b] flex items-center"
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>

                    {showStatusMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40">
                        <button
                          onClick={() => handleStatusChange('verified')}
                          className="flex items-center w-full px-3 py-2 text-blue-600 hover:bg-gray-50 font-semibold"
                        >
                          <span className="w-4 h-4 mr-2 rounded-full border-[3px] border-blue-600" />
                          Verify
                        </button>
                        <div className="border-t border-gray-200" />
                        <button
                          onClick={() => handleStatusChange('declined')}
                          className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-gray-50 font-semibold"
                        >
                          <span className="w-4 h-4 mr-2 rounded-full border-[3px] border-red-600" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
                <div>
                  <h3 className="font-bold text-[#073051] text-xl mb-3">
                    Personal Information
                  </h3>
                  <p>
                    <strong>Phone Number:</strong> {driver.phone_number ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Address:</strong> {driver.full_address ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Created At:</strong>{' '}
                    {driver.created_at
                      ? new Date(driver.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#073051] text-xl mb-3">
                    Vehicle Information
                  </h3>
                  <p>
                    <strong>Plate Number:</strong> {driver.plate_number ?? 'N/A'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-bold text-[#073051] text-xl mb-3">
                    Operator Information
                  </h3>
                  <p>
                    <strong>Name:</strong> {driver.operator_name ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {driver.operator_number ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Address:</strong> {driver.operator_address ?? 'N/A'}
                  </p>
                </div>
              </div>

              {/* Fixed Bottom Button Area */}
              <div className="absolute bottom-6 right-6 flex justify-end space-x-4">
                {isChanged ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px]
                                 text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B]
                                 transition-colors duration-200"
                    >
                      <span>Cancel</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="bg-[#1E86DA] text-white py-2 px-6 rounded-[15px]
                                 hover:bg-[#1478C9] transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default DriverProfilePage;