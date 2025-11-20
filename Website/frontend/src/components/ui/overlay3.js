"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Overlay3({
  isOpen,
  onClose,
  sectionName,
  onSave,
  initialData,
  onDelete,
  role,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const canEdit = role === "admin" || role === "ltfrb";

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setFile(null);
      setPreviewUrl(initialData.file_url || "");
    } else if (!isOpen) {
      setTitle("");
      setDescription("");
      setFile(null);
      setPreviewUrl("");
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(initialData?.file_url || "");
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please provide a title.");
      return;
    }

    if (!file && !initialData?.file_url) {
      alert("Please select a file.");
      return;
    }

    onSave({
      id: initialData?.id,
      file,
      title: title.trim(),
      description: description.trim() || null,
    });
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      if (confirm("Are you sure you want to delete this fare matrix?")) {
        onDelete(initialData.id);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-[30px] shadow-lg w-[90%] max-w-[1500px] max-h-[95vh] overflow-y-auto">
        <h2 className="text-[#073051] text-[28px] sm:text-[32px] font-bold mb-6">
          {initialData
            ? canEdit
              ? "Edit Fare Matrix"
              : "Preview Fare Matrix"
            : "Upload Fare Matrix"}{" "}
          – {sectionName}
        </h2>

        <div className="flex gap-6">
          <div className="w-[40%] space-y-4">
            <div>
              <label className="block text-[18px] font-medium text-[#073051] mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter matrix title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={!canEdit}
                className={`w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px] ${
                  !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-[18px] font-medium text-[#073051] mb-2">
                Description (optional)
              </label>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!canEdit}
                className={`w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px] h-[120px] resize-none ${
                  !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {canEdit && (
              <div>
                <label className="block text-[18px] font-medium text-[#073051] mb-2">
                  File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-[#1E86DA] text-white rounded-[15px] cursor-pointer hover:bg-[#1478C9] transition-colors duration-200"
                >
                  {file ? "Choose Another File" : "Choose File"}
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  Supported: PDF, JPG, PNG
                </p>
              </div>
            )}
          </div>

          <div className="w-[60%] border rounded-lg p-2 h-[600px] flex items-center justify-center bg-gray-50">
            {previewUrl ? (
              previewUrl.endsWith(".pdf") ||
              file?.type === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded"
                  title="PDF Preview"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )
            ) : (
              <p className="text-gray-400 text-center">No file selected</p>
            )}
          </div>
        </div>

        {canEdit ? (
          <div className="flex justify-between items-center mt-6">
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-400 text-red-500 rounded-[15px] hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            )}

            <div className="flex space-x-4 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#D1D1D1] rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-[#1E86DA] text-white rounded-[15px] hover:bg-[#1478C9] transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D1D1D1] rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
