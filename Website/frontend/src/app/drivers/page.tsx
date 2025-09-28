'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import ReactDOM from 'react-dom';
import Header from '../../components/ui/header';
import { FunnelIcon, BarsArrowDownIcon, MagnifyingGlassIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Driver {
  id: string;
  profile: {
    username: string;
    avatar_url: string | null;
    email: string;
    role: string;
  };
  status: 'Pending' | 'Verified' | 'Declined';
  created_at: string;
  plate_number: string;
}

const DriversPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const currentData = drivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleDriverSelection = (id: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(id) ? prev.filter((driverId) => driverId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDrivers.length === currentData.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(currentData.map((driver) => driver.id));
    }
  };

  const allSelected = selectedDrivers.length === currentData.length && currentData.length > 0;

  // Fetch drivers with profiles
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('driverprofiles')
          .select(`
            id,
            status,
            created_at,
            plate_number,
            profiles!inner(username, avatar_url, email, role)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedData: Driver[] = (data || []).map((d: any) => ({
          id: d.id,
          profile: {
            username: d.profiles.username,
            avatar_url: d.profiles.avatar_url,
            email: d.profiles.email,
            role: d.profiles.role
          },
          status: d.status as 'Pending' | 'Verified' | 'Declined',
          created_at: d.created_at,
          plate_number: d.plate_number
        }));

        setDrivers(mappedData);
      } catch (err) {
        console.error('Supabase fetch error:', err);
      }
    };

    fetchDrivers();
  }, []);

  // Improved: update status immediately on click
  const handleStatusChange = async (id: string, newStatus: 'Verified' | 'Declined') => {
    // Update local state immediately
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    setSelectedDriver(null);

    // Update in Supabase
    try {
      const { error } = await supabase.from('driverprofiles').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update error:', err);
      // Optionally revert local state if error occurs
      setDrivers((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'Pending' } : d))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-menu') &&
          !(e.target as HTMLElement).closest('.dropdown-trigger')) {
        setSelectedDriver(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A]
                hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
              <BarsArrowDownIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Sort</span>
            </button>
            <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A]
                hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
              <FunnelIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Title + Pagination */}
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">Drivers</h1>

          <Pagination className="flex justify-end w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${currentPage === i + 1 ? 'bg-[#D1D1D1] text-[#6B6B6B]' : ''}`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Table */}
        <Table className="shadow-none border border-[#D1D1D1] rounded-md overflow-hidden">
          <TableHeader>
            <tr>
              <TableHead>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all drivers"
                />
              </TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {currentData.map((driver) => (
              <TableRow
                key={driver.id}
                onClick={() => router.push(`/drivers/${driver.id}`)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedDrivers.includes(driver.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDriverSelection(driver.id);
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Image
                    src={driver.profile.avatar_url || "/Default Profile.svg"}
                    alt={driver.profile.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </TableCell>

                <TableCell>{driver.profile.username}</TableCell>
                <TableCell>{driver.plate_number}</TableCell>

                {/* Status with same format as dashboard */}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      driver.status === 'Verified'
                        ? 'bg-blue-100 text-blue-700'
                        : driver.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {driver.status}
                  </span>
                </TableCell>

                <TableCell>{new Date(driver.created_at).toLocaleString()}</TableCell>

                <TableCell onClick={(e) => e.stopPropagation()} className="relative">
                  <button
                    className="dropdown-trigger flex items-center justify-center w-6 h-6 text-gray-500"
                    onClick={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                      setSelectedDriver(selectedDriver?.id === driver.id ? null : driver);
                    }}
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>

                  {selectedDriver?.id === driver.id &&
                    dropdownPosition &&
                    ReactDOM.createPortal(
                      <div
                        className="dropdown-menu absolute w-40 bg-white border border-gray-200 rounded-lg shadow-md z-50"
                        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                      >
                        <button
                          onClick={() => handleStatusChange(driver.id, 'Verified')}
                          className="flex items-center w-full px-3 py-2 text-blue-600 hover:bg-gray-50 font-semibold"
                        >
                          <span className="w-4 h-4 mr-2 rounded-full border-[3px] border-blue-600" />
                          Verify
                        </button>
                        <div className="border-t border-gray-200" />
                        <button
                          onClick={() => handleStatusChange(driver.id, 'Declined')}
                          className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-gray-50 font-semibold"
                        >
                          <span className="w-4 h-4 mr-2 rounded-full border-[3px] border-red-600" />
                          Decline
                        </button>
                      </div>,
                      document.body
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </>
  );
};

export default DriversPage;