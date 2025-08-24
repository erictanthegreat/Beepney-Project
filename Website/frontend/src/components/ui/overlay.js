import React from 'react';

const Overlay = ({ isOpen, onClose, sectionName }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlayContent p-6 rounded-[30px]">
        <h2 className="text-[#073051] text-[40px] font-bold mb-12">{sectionName}</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
              placeholder="Enter hotline name"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
              placeholder="Enter hotline number"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
          >
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1E86DA] text-white py-2 px-6 rounded-[15px] hover:bg-[#1478C9] transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
