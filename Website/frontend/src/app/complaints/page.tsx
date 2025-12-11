"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Header from "../../components/ui/header";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  MagnifyingGlassIcon,
  BarsArrowDownIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ComplaintSummaryModal from "../../components/ui/overlay4";

// --- HELPER FUNCTIONS ---

const formatDate = (isoString: string | null) => {
  if (!isoString || isoString === "N/A") return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString: string | null) => {
  if (!timeString || timeString === "N/A") return "N/A";
  if (timeString.includes(":")) {
    try {
      const [hours, minutes, seconds] = timeString.split(":");
      const date = new Date();
      date.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds || "0", 10)
      );
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {}
  }

  const date = new Date(timeString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return timeString;
};

// --- TYPES ---

type ComplaintStatus =
  | "Pending"
  | "Received"
  | "In-Review"
  | "In-Action"
  | "Solved";

interface Submission {
  id: string;
  user_id: string;
  username: string;
  submitted_info: string;
  types_of_issues: string;
  role: string;
  updated_at: string;
  created_at: string;
  status: ComplaintStatus;
  description?: string;
  date_of_incident: string;
  time_of_incident: string;
  location: string;
  contact_information: string;
  proofs: string | null;
}

const DashboardPage = () => {
  const [data, setData] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Submission | null>(
    null
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // ✅ Supabase client reference
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    // Only initialize Supabase on client
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    setSupabase(supabaseClient);

    const fetchData = async () => {
      try {
        const { data: complaints, error } = await supabaseClient
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!complaints) return;

        const mapped = complaints.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          username: c.name || "N/A",
          submitted_info: c.contact_information || "N/A",
          contact_information: c.contact_information || "N/A",
          types_of_issues: c.type_of_issues || "N/A",
          location: c.location || "N/A",
          date_of_incident: c.date_of_incident || c.created_at,
          time_of_incident: c.time_of_incident || c.created_at,
          proofs: c.proofs || null,
          role: c.user_type || "N/A",
          updated_at: c.updated_at,
          created_at: c.created_at,
          status: (c.status as ComplaintStatus) || "Pending",
          description: c.description || "N/A",
        }));

        setData(mapped as Submission[]);
      } catch (err) {
        console.error("Supabase fetch error:", err);
        toast.error("Failed to fetch complaints");
      }
    };

    fetchData();
  }, []);

  const handleDecision = async (id: string, newStatus: ComplaintStatus) => {
    if (!supabase) return;

    const originalStatus =
      data.find((item) => item.id === id)?.status || "Pending";
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    setSelectedSubmission(null);
    setDropdownPosition(null);

    const sortedByOldest = [...data].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const rowIndex = sortedByOldest.findIndex((item) => item.id === id);
    const displayNumber = rowIndex + 1;

    toast.success(
      `Submission #${displayNumber} status updated to: ${newStatus}`
    );

    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: originalStatus } : item
        )
      );
      toast.error(`Failed to update status. Rolled back.`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".dropdown-menu") &&
        !target.closest(".dropdown-trigger")
      ) {
        setSelectedSubmission(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusClasses = (status: ComplaintStatus) => {
    switch (status) {
      case "Solved":
        return "bg-green-100 text-green-700";
      case "In-Action":
        return "bg-blue-100 text-blue-700";
      case "In-Review":
        return "bg-yellow-100 text-yellow-700";
      case "Received":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Header />
      <Toaster />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        {/* Search + Sort */}
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
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">
            Complaints
          </h1>

          <Pagination className="flex justify-end w-full sm:w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] ${
                    currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`group border border-[#D1D1D1] text-[#073051] rounded-[10px] px-4 py-2 hover:bg-[#D1D1D1] ${
                    currentPage === totalPages
                      ? "opacity-50 pointer-events-none"
                      : ""
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
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type of Issue</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {currentData.map((item) => {
              const sortedByOldest = [...data].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );
              const rowNumber =
                sortedByOldest.findIndex((d) => d.id === item.id) + 1;

              return (
                <TableRow key={item.id}>
                  <TableCell>{rowNumber}</TableCell>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>{item.contact_information}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{formatDate(item.date_of_incident)}</TableCell>
                  <TableCell>{formatTime(item.time_of_incident)}</TableCell>
                  <TableCell>{item.types_of_issues}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.description}
                  </TableCell>

                  <TableCell>
                    {formatDate(item.created_at)} {formatTime(item.created_at)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </TableCell>

                  <TableCell className="flex space-x-2">
                    <button
                      onClick={() => setViewingComplaint(item)}
                      className="text-[#073051] hover:text-blue-700"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    <button
                      className="dropdown-trigger flex items-center justify-center w-6 h-6 text-gray-500"
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement)
                          .closest("button")!
                          .getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX,
                        });
                        setSelectedSubmission(
                          selectedSubmission?.id === item.id ? null : item
                        );
                      }}
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>

                    {selectedSubmission?.id === item.id &&
                      dropdownPosition &&
                      ReactDOM.createPortal(
                        <div
                          className="dropdown-menu absolute w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                          style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left - 140,
                            position: "absolute",
                          }}
                        >
                          <button
                            onClick={() => handleDecision(item.id, "Received")}
                            className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-gray-50 font-semibold"
                            disabled={item.status === "Received"}
                          >
                            Received
                          </button>
                          <button
                            onClick={() => handleDecision(item.id, "In-Review")}
                            className="flex items-center w-full px-3 py-2 text-yellow-600 hover:bg-gray-50 font-semibold"
                            disabled={item.status === "In-Review"}
                          >
                            In-Review
                          </button>
                          <button
                            onClick={() => handleDecision(item.id, "In-Action")}
                            className="flex items-center w-full px-3 py-2 text-blue-600 hover:bg-gray-50 font-semibold"
                            disabled={item.status === "In-Action"}
                          >
                            In-Action
                          </button>
                          <button
                            onClick={() => handleDecision(item.id, "Solved")}
                            className="flex items-center w-full px-3 py-2 text-green-600 hover:bg-gray-50 font-semibold"
                            disabled={item.status === "Solved"}
                          >
                            Solved
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

      {viewingComplaint && (
        <ComplaintSummaryModal
          complaint={viewingComplaint}
          rowNumber={
            [...data]
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
              .findIndex((d) => d.id === viewingComplaint.id) + 1
          }
          onClose={() => setViewingComplaint(null)}
        />
      )}
    </>
  );
};

export default DashboardPage;