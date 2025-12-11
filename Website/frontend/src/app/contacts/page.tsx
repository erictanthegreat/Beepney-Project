"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "../../components/ui/header";
import Overlay from "../../components/ui/overlay";
import { PlusIcon } from "@heroicons/react/24/outline";
import { BarsArrowDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface Hotline {
  id: string;
  section: string;
  name: string;
  number: string;
  address?: string;
  aor: string;
  created_at: string;
}

type NewHotline = {
  name: string;
  number: string;
  aor: string;
  address?: string;
};

const contactSections = [
  { key: "Ambulance", label: "Ambulance" },
  { key: "Police", label: "Police Station" },
  { key: "LTFRB", label: "LTFRB" },
];

// Format Philippine numbers to +63XXX-XXX-YYYY
const formatPHNumber = (num: string): string => {
  const digits = num.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) {
    return `+63${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 12 && digits.startsWith("9")) {
    return `+63${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return num;
};

const ContactsPage: React.FC = () => {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [editingHotline, setEditingHotline] = useState<Hotline | null>(null);
  const [role, setRole] = useState<string>("commuter");
  const canEdit = () => role === "admin" || role === "pso";

  useEffect(() => {
    fetchHotlines();
    fetchUserRole();
  }, []);

  const fetchHotlines = async () => {
    const { data, error } = await supabase.from("hotlines").select("*");
    if (error) console.error("Error fetching hotlines:", error.message);
    else setHotlines(data || []);
  };

  const fetchUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data?.role) {
        setRole(data.role);
      }
    }
  };

  const openOverlay = (section: string) => {
    if (!canEdit()) return;
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
    if (!canEdit()) return;
    if (editingHotline) {
      const { data, error } = await supabase
        .from("hotlines")
        .update(hotlineData)
        .eq("id", editingHotline.id)
        .select();

      if (error) console.error("Error updating hotline:", error.message);
      else
        setHotlines((prev) =>
          prev.map((h) => (h.id === editingHotline.id ? data![0] : h))
        );
    } else {
      const { data, error } = await supabase
        .from("hotlines")
        .insert([{ section: selectedSection, ...hotlineData }])
        .select();

      if (error) console.error("Error adding hotline:", error.message);
      else setHotlines((prev) => [...prev, ...(data || [])]);
    }

    setIsOverlayOpen(false);
    setEditingHotline(null);
  };

  const handleDeleteHotline = async (id: string) => {
    if (!canEdit()) return;
    const { error } = await supabase.from("hotlines").delete().eq("id", id);

    if (error) {
      console.error("Error deleting hotline:", error.message);
    } else {
      setHotlines((prev) => prev.filter((h) => h.id !== id));
    }

    setIsOverlayOpen(false);
    setEditingHotline(null);
  };

  return (
    <>
      <main className="relative h-screen w-full overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <Header />
        </div>

        {/* Page content (scrolls normally) */}
        <div className="overflow-auto max-h-[calc(100vh-80px)]">
        <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-10 space-y-[45px] pb-20">
          {/* Page header + action buttons */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">
              Contacts
            </h1>

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

          {/* Contact sections */}
          {contactSections.map(({ key, label }) => {
            const sectionHotlines = hotlines.filter((h) => h.section === key);

            return (
              <div key={key}>
                <h2 className="text-[32px] sm:text-[30px] font-bold text-[#073051] mb-6">
                  {label}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {sectionHotlines.map((h, idx) => (
                    <div
                      key={h.id}
                      className="border border-[#D1D1D1] rounded-[15px] p-4 flex flex-col flex-1 min-h-[100px] gap-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleEditHotline(h)}
                    >
                      <div className="w-3 h-3 mt-1 rounded-full bg-[#1E86DA] flex-shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-semibold text-[#073051] text-lg truncate">
                          {key} Hotline {idx + 1}{" "}
                          <span className="text-[#595959] font-normal truncate">
                            ({h.name})
                          </span>
                        </p>
                        <p className="text-[#0F76C2] text-sm">
                          {formatPHNumber(h.number)}
                        </p>
                        {h.address && <p className="text-[#9A9A9A] text-sm">{h.address}</p>}
                        {h.aor && (
                          <p className="text-[#9A9A9A] text-sm">
                            <strong>AOR:</strong> {h.aor}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {canEdit() && (
                    <div
                      className="border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 group w-full h-full min-h-[100px]"
                      onClick={() => openOverlay(key)}
                    >
                      <PlusIcon className="h-7 w-7 text-[#CBCBCB] group-hover:text-[#6B6B6B]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </main></div>

        <Overlay
          isOpen={isOverlayOpen}
          onClose={() => {
            setIsOverlayOpen(false);
            setEditingHotline(null);
          }}
          sectionName={selectedSection}
          onSave={handleSaveHotline}
          onDelete={handleDeleteHotline}
          initialData={editingHotline || undefined}
          role={role}
        />
      </main>
    </>
  );
};

export default ContactsPage;
