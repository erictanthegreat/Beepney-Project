"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "../../components/ui/header";
import { PlusIcon } from "@heroicons/react/24/outline";
import Overlay3 from "../../components/ui/overlay3";
import { Cog6ToothIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface FareMatrix {
  id: string;
  section: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  created_at: string;
  uploaded_by: string;
}

export type Role = "commuter" | "admin" | "ltfrb";

const fareSections = [
  { key: "PUB", label: "PUB City & Provincial" },
  { key: "PUJ", label: "PUJ" },
  { key: "Tricycle", label: "Tricyle" },
  { key: "Taxi", label: "Taxi" },
  { key: "UV Express", label: "UV Express" },
];

const FareMatrixPage = () => {
  const [matrices, setMatrices] = useState<FareMatrix[]>([]);
  const [role, setRole] = useState<Role>("commuter");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedMatrix, setSelectedMatrix] = useState<FareMatrix | null>(null);

  const canEdit = () => role === "admin" || role === "ltfrb";

  useEffect(() => {
    fetchMatrices();
    fetchRole();
  }, []);

  const fetchMatrices = async () => {
    const { data, error } = await supabase
      .from("fare_matrix")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setMatrices(data);
  };

  const fetchRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        const validRoles: Role[] = ["commuter", "admin", "ltfrb"];
        const userRole = validRoles.includes(data.role)
          ? (data.role as Role)
          : "commuter";
        setRole(userRole);
      }
    }
  };

  const handleSaveFare = async ({
    id,
    file,
    title,
    description,
  }: {
    id?: string;
    file?: File | null;
    title: string;
    description?: string | null;
  }) => {
    if (!canEdit()) return;

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (file) {
        const timestamp = Date.now();
        const filePath = `fare-matrix/${selectedSection}/${timestamp}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("beepney-bucket")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          alert("Error uploading file: " + uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("beepney-bucket")
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
        fileName = file.name;
      }

      if (id) {
        const { error: updateError } = await supabase
          .from("fare_matrix")
          .update({
            title,
            description,
            ...(fileUrl && { file_url: fileUrl }),
            ...(fileName && { file_name: fileName }),
          })
          .eq("id", id);

        if (updateError) throw updateError;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { error: insertError } = await supabase
          .from("fare_matrix")
          .insert([
            {
              section: selectedSection,
              title,
              description,
              file_url: fileUrl,
              file_name: fileName,
              uploaded_by: user?.id,
            },
          ]);

        if (insertError) throw insertError;
      }

      fetchMatrices();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong.");
    }

    setOverlayOpen(false);
    setSelectedSection("");
    setSelectedMatrix(null);
  };

  const handleDeleteFare = async (id: string) => {
    if (!canEdit()) return;

    const { error } = await supabase.from("fare_matrix").delete().eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchMatrices();
    }

    setOverlayOpen(false);
    setSelectedMatrix(null);
  };

  const handleAddFare = (key: string) => {
    if (!canEdit()) return;
    setSelectedMatrix(null);
    setSelectedSection(key);
    setOverlayOpen(true);
  };

  const handleEditFare = (matrix: FareMatrix) => {
    setSelectedMatrix(matrix);
    setSelectedSection(matrix.section);
    setOverlayOpen(true);
  };

  return (
    <>
      <main className="relative h-screen w-full overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <Header />
        </div>

        {/* Scrollable main content */}
        <div className="overflow-auto max-h-[calc(100vh-80px)]">
          <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-10 space-y-[45px] pb-20">
            {/* Page header and buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051]">
                Fare Matrix
              </h1>

              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
                  <Cog6ToothIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
                  <span>Configure</span>
                </button>
                <button className="group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200">
                  <FunnelIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Fare Sections */}
            {fareSections.map(({ key, label }) => (
              <div key={key}>
                <h2 className="text-[32px] sm:text-[30px] font-bold text-[#073051] mb-6">
                  {label}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {matrices
                    .filter((m) => m.section === key)
                    .map((m, idx) => (
                      <div
                        key={m.id}
                        className="border border-[#D1D1D1] rounded-[15px] p-4 flex flex-col flex-1 min-h-[100px] gap-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleEditFare(m)}
                      >
                        <div className="w-3 h-3 mt-1 rounded-full bg-[#1E86DA] flex-shrink-0" />

                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-semibold text-[#073051] text-lg truncate">
                            {key} Fare {idx + 1}{" "}
                            <span className="text-[#595959] font-normal truncate">
                              ({m.title})
                            </span>
                          </p>
                          <p className="text-sm text-gray-500 truncate">{m.file_name}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(m.created_at).toLocaleDateString()}
                          </p>
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 mt-2 text-sm hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    ))}

                  {canEdit() && (
                    <div
                      className="border border-[#D1D1D1] rounded-[15px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 group w-full h-full min-h-[100px]"
                      onClick={() => handleAddFare(key)}
                    >
                      <PlusIcon className="h-7 w-7 text-[#CBCBCB] group-hover:text-[#6B6B6B]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </main>
        </div>

        <Overlay3
          isOpen={overlayOpen}
          onClose={() => {
            setOverlayOpen(false);
            setSelectedMatrix(null);
          }}
          sectionName={selectedSection}
          onSave={handleSaveFare}
          initialData={selectedMatrix ?? undefined}
          onDelete={handleDeleteFare}
          role={role}
        />
      </main>
    </>
  );
};

export default FareMatrixPage;