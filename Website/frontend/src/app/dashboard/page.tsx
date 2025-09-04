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

interface Submission {
  id: number;
  name: string;
  submittedInfo: string;
  type: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Declined';
  frontImageUrl?: string;
  backImageUrl?: string;
}

// Sample data
const initialData: Submission[] = [
  { id: 1, name: 'John Doe', submittedInfo: 'Driver License Info', type: "Driver's License", submittedAt: '2023-09-15 14:23', status: 'Pending' },
  { id: 2, name: 'Jane Smith', submittedInfo: 'Discount Info', type: 'Student', submittedAt: '2023-09-16 10:50', status: 'Approved' },
  { id: 3, name: 'Mark Johnson', submittedInfo: 'Driver License Renewal', type: "Driver's License", submittedAt: '2023-09-17 09:15', status: 'Declined' },
  { id: 4, name: 'Sarah Lee', submittedInfo: 'Senior Discount Proof', type: 'Senior Citizen', submittedAt: '2023-09-18 11:30', status: 'Pending' },
  { id: 5, name: 'Tom Williams', submittedInfo: 'Vehicle Registration', type: "Driver's License", submittedAt: '2023-09-19 14:45', status: 'Approved' },
  { id: 6, name: 'Emily Davis', submittedInfo: 'Student Discount Proof', type: 'Student', submittedAt: '2023-09-20 08:50', status: 'Pending' }
];

const DashboardPage = () => {
  const [data, setData] = useState<Submission[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [overlayData, setOverlayData] = useState<Submission | null>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDecision = (id: number, decision: 'Approved' | 'Declined') => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: decision } : item
      )
    );
    setSelectedSubmission(null); // close dropdown

    // Show toast notification
    if (decision === 'Approved') {
      toast.success(`Submission ${id} approved`);
    } else {
      toast.error(`Submission ${id} declined`);
    }
  };

  // Close dropdown on outside click
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
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${
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
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200 ${
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
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setOverlayData(item)}
                  >
                    {item.submittedInfo}
                  </button>
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.submittedAt}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </main>

      {/* Overlay */}
      <Overlay2
        isOpen={!!overlayData}
        onClose={() => setOverlayData(null)}
        name={overlayData?.name || ''}
        idType={overlayData?.type || ''}
        frontImageUrl={overlayData?.frontImageUrl || '/placeholder-front.png'}
        backImageUrl={overlayData?.backImageUrl || '/placeholder-back.png'}
      />
    </>
  );
};

export default DashboardPage;