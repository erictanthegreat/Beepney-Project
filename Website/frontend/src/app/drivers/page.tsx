'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Header from '../../components/ui/header';
import { FunnelIcon, BarsArrowDownIcon, MagnifyingGlassIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import Image from 'next/image'; // ✅ use Next.js Image

const drivers = [
  { id: 1, name: 'John Doe', status: 'Active', createdAt: '2023-06-10 09:00', plateNumber: 'ABC-1234' },
  { id: 2, name: 'Jane Smith', status: 'Inactive', createdAt: '2023-07-21 13:45', plateNumber: 'XYZ-5678' },
  { id: 3, name: 'Mark Johnson', status: 'Active', createdAt: '2023-05-01 08:30', plateNumber: 'JKL-9101' },
  { id: 4, name: 'Sarah Lee', status: 'Active', createdAt: '2023-04-12 11:15', plateNumber: 'MNO-2345' },
  { id: 5, name: 'Tom Williams', status: 'Inactive', createdAt: '2023-08-30 14:00', plateNumber: 'PQR-6789' },
  { id: 6, name: 'Emily Davis', status: 'Active', createdAt: '2023-09-05 09:20', plateNumber: 'STU-3456' }
];

const DriversPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const currentData = drivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleDriverSelection = (id: number) => {
    setSelectedDrivers((prev) => prev.includes(id) ? prev.filter((driverId) => driverId !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedDrivers.length === currentData.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(currentData.map((driver) => driver.id));
    }
  };

  const allSelected = selectedDrivers.length === currentData.length && currentData.length > 0;

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Search */}
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

          {/* Sort & Filter */}
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
                  {/* ✅ Fix: use Next.js Image */}
                  <Image
                    src="/Default Profile.svg"
                    alt={driver.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </TableCell>

                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.plateNumber}</TableCell>
                <TableCell>{driver.status}</TableCell>
                <TableCell>{driver.createdAt}</TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button className="flex items-center justify-center w-6 h-6 text-gray-500">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
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