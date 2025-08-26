import React, { useState, useEffect } from 'react';

/**
 * @typedef {Object} OverlayProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} sectionName
 * @property {(hotline: { name: string; number: string; address?: string }) => void} onSave
 * @property {{ name: string; number: string; address?: string }} [initialData]
 */

/**
 * @param {OverlayProps} props
 */

export default function Overlay({ isOpen, onClose, sectionName, onSave, initialData }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('+63');

  // Prefill fields when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      const digits = initialData.number.replace(/\D/g, '');
      if (digits.startsWith('63')) {
        setCountryCode('+63');
        setNumber(digits.slice(2));
      } else {
        setNumber(digits);
      }
      setAddress(initialData.address || '');
    } else {
      setName('');
      setNumber('');
      setAddress('');
      setCountryCode('+63');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !number) return;
    const fullNumber = `${countryCode}${number.replace(/\D/g, '')}`;
    onSave({ name, number: fullNumber, address });
    // Reset after save
    setName('');
    setNumber('');
    setAddress('');
    setCountryCode('+63');
  };

  return (
    <div className="overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="overlayContent bg-white p-6 rounded-[30px] shadow-lg w-[400px]">
        <h2 className="text-[#073051] text-[32px] sm:text-[36px] font-bold mb-6">
          {initialData ? 'Edit Hotline' : 'Add Hotline'} – {sectionName}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Name</label>
            <input
              type="text"
              placeholder="Enter hotline name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Number</label>
            <div className="flex space-x-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border border-[#D1D1D1] rounded-lg focus:outline-none appearance-none"
              >
                <option value="+63">+63</option>
              </select>
              <input
                type="text"
                placeholder="9XX-XXX-YYYY"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                maxLength={10}
                className="flex-1 px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Format: 9XX-XXX-YYYY (country code added automatically)
            </p>
          </div>

          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Address</label>
            <input
              type="text"
              placeholder="Enter address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
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
    </div>
  );
}
