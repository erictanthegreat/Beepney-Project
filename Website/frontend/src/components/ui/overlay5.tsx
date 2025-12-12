import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface FareConfig {
  id?: string;
  vehicle_type: string;
  base_fare: number | null;
  threshold_km: number | null;
  excess_rate: number | null;
  rate_per_km: number | null;
  add_per_km_after: number | null;
  add_amount: number | null;
  created_at?: string;
  updated_at?: string;
}

interface FareConfigOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configs: FareConfig[]) => Promise<void>;
  initialConfigs?: FareConfig[];
}

const Overlay5: React.FC<FareConfigOverlayProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfigs = [],
}) => {
  const [configs, setConfigs] = useState<FareConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialConfigs.length > 0) {
        setConfigs(initialConfigs);
      } else {
        setConfigs([
          {
            vehicle_type: "",
            base_fare: null,
            threshold_km: null,
            excess_rate: null,
            rate_per_km: null,
            add_per_km_after: null,
            add_amount: null,
          },
        ]);
      }
    }
  }, [isOpen, initialConfigs]);

  const handleInputChange = (
    index: number,
    field: keyof FareConfig,
    value: string
  ) => {
    const updated = [...configs];
    const numericValue =
      field !== "vehicle_type" && value !== "" ? parseFloat(value) : null;

    updated[index] = {
      ...updated[index],
      [field]: field === "vehicle_type" ? value : numericValue,
    };

    setConfigs(updated);
  };

  const handleAddRow = () => {
    setConfigs([
      ...configs,
      {
        vehicle_type: "",
        base_fare: null,
        threshold_km: null,
        excess_rate: null,
        rate_per_km: null,
        add_per_km_after: null,
        add_amount: null,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setConfigs(configs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const valid = configs.filter(
      (c) => c.vehicle_type && c.vehicle_type.trim() !== ""
    );

    if (valid.length === 0) {
      alert("Please enter at least one valid vehicle type.");
      return;
    }

    setIsSaving(true);

    try {
      await onSave(valid);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className=" overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
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
                Configure Fare Pricing
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage fare configurations for all vehicle types.
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
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {[
                    "Vehicle Type",
                    "Base Fare",
                    "Threshold KM",
                    "Excess Rate",
                    "Rate per KM",
                    "Add per KM After",
                    "Add Amount After",
                  ].map((name, idx) => (
                    <th
                      key={idx}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200"
                    >
                      {name}
                    </th>
                  ))}
                  <th className="border-b border-gray-200 w-[50px]"></th>
                </tr>
              </thead>

              <tbody>
                {configs.map((config, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">
                      <input
                        type="text"
                        value={config.vehicle_type}
                        onChange={(e) =>
                          handleInputChange(i, "vehicle_type", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Enter type"
                      />
                    </td>

                    {[
                      "base_fare",
                      "threshold_km",
                      "excess_rate",
                      "rate_per_km",
                      "add_per_km_after",
                      "add_amount",
                    ].map((field) => (
                      <td key={field} className="px-4 py-3 border-b">
                        <input
                          type="number"
                          step="0.01"
                          value={config[field as keyof FareConfig] ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              i,
                              field as keyof FareConfig,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="NULL"
                        />
                      </td>
                    ))}

                    <td className="px-4 py-3 border-b">
                      <button
                        onClick={() => handleRemoveRow(i)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row */}
          <button
            onClick={handleAddRow}
            className="mt-6 flex items-center space-x-2 px-4 py-2 text-[#073051] hover:bg-blue-50 rounded-lg"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Row</span>
          </button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#073051] text-white rounded-lg hover:bg-[#052440] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Overlay5;
