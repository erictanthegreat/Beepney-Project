'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/ui/header';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Driver {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  plateNumber: string;
}

const drivers: Driver[] = [
  { id: 1, name: 'John Doe', status: 'Active', createdAt: '2023-06-10 09:00', plateNumber: 'ABC-1234' },
  { id: 2, name: 'Jane Smith', status: 'Inactive', createdAt: '2023-07-21 13:45', plateNumber: 'XYZ-5678' },
  { id: 3, name: 'Mark Johnson', status: 'Active', createdAt: '2023-05-01 08:30', plateNumber: 'JKL-9101' },
  { id: 4, name: 'Sarah Lee', status: 'Active', createdAt: '2023-04-12 11:15', plateNumber: 'MNO-2345' },
  { id: 5, name: 'Tom Williams', status: 'Inactive', createdAt: '2023-08-30 14:00', plateNumber: 'PQR-6789' },
  { id: 6, name: 'Emily Davis', status: 'Active', createdAt: '2023-09-05 09:20', plateNumber: 'STU-3456' }
];

const DriverProfilePage = () => {
  const { driverId } = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driverId) {
      setLoading(true);
      setError(null);

      setTimeout(() => {
        const driverData = drivers.find((d) => d.id === parseInt(driverId as string, 10));
        if (driverData) {
          setDriver(driverData);
        } else {
          setError("No driver found with the given ID.");
        }
        setLoading(false);
      }, 800);
    }
  }, [driverId]);

  const handleBackClick = () => {
    router.push('/drivers');
  };

  const handleCancel = () => {
    router.push('/drivers');
  };

  const handleSave = () => {
    alert("Changes saved!"); // replace with API later
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[25px]">
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

          <h1 className="text-[#073051] font-bold text-[32px] sm:text-[40px]">
            Driver's Profile Details
          </h1>
        </div>

        {/* Driver Details */}
        <div
          className="bg-white rounded-[30px] p-6 flex flex-col border-[1px] border-[#D1D1D1] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[680px] w-full"
        >
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <p className="text-gray-500">Loading driver details...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center flex-1">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {!loading && driver && (
            <div className="flex flex-col justify-between flex-1">
              {/* driver info */}
              <div className="w-full space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Name: {driver.name}</h2>
                  <p><strong>Plate Number:</strong> {driver.plateNumber}</p>
                  <p><strong>Status:</strong> {driver.status}</p>
                  <p><strong>Created At:</strong> {driver.createdAt}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">More Information</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>

              {/* bottom-right buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
                >
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-[#1E86DA] text-white py-2 px-6 rounded-[15px] hover:bg-[#1478C9] transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DriverProfilePage;