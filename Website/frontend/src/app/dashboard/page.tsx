'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Header from '../../components/ui/header';
import { Toaster, toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@/components/ui/table';
import {
  MagnifyingGlassIcon,
  BarsArrowDownIcon,
  EllipsisVerticalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink
} from '@/components/ui/pagination';
import Overlay2 from '../../components/ui/overlay2';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Submission {
  id: string;
  user_id: string;
  username: string; // mapped from profiles
  submitted_info: string;
  submission_type: string; // mapped from submissions.submission_type
  role: string; // commuter or driver
  updated_at: string;
  created_at: string;
  status: 'Pending' | 'Approved' | 'Declined';
  front_id_url?: string;
  back_id_url?: string;
}

const DashboardPage = () => {
  const [data, setData] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [overlayData, setOverlayData] = useState<Submission | null>(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: fetch submissions
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!submissions) return;

        // Step 2: fetch usernames from profiles
        const userIds = submissions.map(s => s.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = Object.fromEntries(
          (profilesData || []).map(p => [p.id, p.username])
        );

        // Step 3: map usernames and roles
        const mapped = submissions.map((s: any) => ({
          ...s,
          username: profilesMap[s.user_id] || 'N/A',
          role: s.type || 'N/A',
        }));

        setData(mapped as Submission[]);
      } catch (err) {
        console.error('Supabase fetch error:', err);
        toast.error('Failed to fetch submissions');
      }
    };

    fetchData();
  }, []);

  const handleDecision = async (id: string, decision: 'Approved' | 'Declined') => {
    const sortedByOldest = [...data].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const rowIndex = sortedByOldest.findIndex(item => item.id === id);
    const displayNumber = rowIndex + 1;

    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: decision } : item
      )
    );
    setSelectedSubmission(null);

    toast.success(
      decision === 'Approved'
        ? `Submission #${displayNumber} approved`
        : `Submission #${displayNumber} declined`
    );

    const { error } = await supabase
      .from('submissions')
      .update({ status: decision })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update submission');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-menu') &&
          !(e.target as HTMLElement).closest('.dropdown-trigger')) {
        setSelectedSubmission(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Header />
      <Toaster />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {/* Search + Sort + Filter */}
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
            <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
              <BarsArrowDownIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Sort</span>
            </button>
            <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
              <FunnelIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Header + Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">Database</h1>

          <Pagination className="flex justify-end w-full sm:w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] ${
                      currentPage === i + 1 ? 'bg-[#D1D1D1] text-[#6B6B6B]' : ''
                    }`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] ${
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Table */}
        <Table className="shadow-none rounded-md overflow-visible">
          <TableHeader>
            <tr>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Submitted Info</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {currentData.map((item) => {
              const sortedByOldest = [...data].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              const rowNumber = sortedByOldest.findIndex(d => d.id === item.id) + 1;

              return (
                <TableRow key={item.id}>
                  <TableCell>{rowNumber}</TableCell>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setOverlayData(item)}
                    >
                      {item.submitted_info}
                    </button>
                  </TableCell>
                  <TableCell>{item.submission_type}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        item.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="relative">
                    <button
                      className="dropdown-trigger flex items-center justify-center w-6 h-6 text-gray-500"
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                        setSelectedSubmission(selectedSubmission?.id === item.id ? null : item);
                      }}
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>

                    {selectedSubmission?.id === item.id &&
                      dropdownPosition &&
                      ReactDOM.createPortal(
                        <div
                          className="dropdown-menu absolute w-40 bg-white border border-gray-200 rounded-lg shadow-md z-50"
                          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                        >
                          <button
                            onClick={() => handleDecision(item.id, 'Approved')}
                            className="flex items-center w-full px-3 py-2 text-green-600 hover:bg-gray-50 font-semibold"
                          >
                            <span className="w-4 h-4 mr-2 rounded-full border-[3px] border-green-600" />
                            Approve
                          </button>
                          <div className="border-t border-gray-200" />
                          <button
                            onClick={() => handleDecision(item.id, 'Declined')}
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
              );
            })}
          </TableBody>
        </Table>
      </main>

      {/* Overlay */}
      <Overlay2
        isOpen={!!overlayData}
        onClose={() => setOverlayData(null)}
        name={overlayData?.username || ''}
        idType={overlayData?.submission_type || ''}
        frontImageUrl={overlayData?.front_id_url || ''}
        backImageUrl={overlayData?.back_id_url || ''}
      />
    </>
  );
};

export default DashboardPage;