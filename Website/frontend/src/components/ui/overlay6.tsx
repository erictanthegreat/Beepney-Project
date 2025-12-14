import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Overlay6Props {
  isOpen: boolean;
  complaintId: string;
  complaintUsername: string;
  onClose: () => void;
  onSubmit: (complaintId: string, reason: string) => Promise<void>;
}

const Overlay6: React.FC<Overlay6Props> = ({
  isOpen,
  complaintId,
  complaintUsername,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for dismissing the complaint.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(complaintId, reason);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to dismiss complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="overlay6" onClick={onClose}>
      <div
        className="overlay6Content max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Image
              src="/Beepney Logo (Website 2).svg"
              width={40}
              height={40}
              alt="bp"
            />
            <div>
              <h2 className="text-2xl font-bold text-[#073051]">
                Dismiss Complaint
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Admin action required for complaint by{" "}
                <strong>{complaintUsername}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex flex-col space-y-4">
          <label className="text-gray-700 font-semibold">
            Reason for Dismissal <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            rows={6}
            placeholder="Enter reason for dismissing this complaint..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 font-medium"
          >
            <span>{isSubmitting ? "Submitting..." : "Dismiss Complaint"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Overlay6;
