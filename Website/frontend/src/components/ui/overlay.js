import React, { useState } from 'react';

/**
 * @typedef {Object} OverlayProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} sectionName
 * @property {(hotline: { name: string; number: string }) => void} onSave
 */

export default function Overlay({ isOpen, onClose, sectionName, onSave }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+63');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !number) return;

    // combine country code + number
    const fullNumber = `${countryCode}${number.replace(/\D/g, '')}`;
    onSave({ name, number: fullNumber });

    setName('');
    setNumber('');
    setCountryCode('+63');
  };

  return (
    <div className="overlay">
      <div className="overlayContent p-6 rounded-[30px] shadow-lg">
        <h2 className="text-[#073051] text-[32px] sm:text-[40px] font-bold mb-6">
          {sectionName}
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
              className="px-3 py-2 border border-[#D1D1D1] rounded-lg 
                        focus:outline-none focus:ring-0 focus:border-[#D1D1D1] 
                        hover:border-[#D1D1D1] appearance-none"
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