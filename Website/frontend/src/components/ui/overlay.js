import React, { useState, useEffect } from 'react'

/**
 * @typedef {Object} OverlayProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} sectionName
 * @property {(hotline: { name: string; number: string; address?: string }) => void} onSave
 * @property {{ id?: string; name: string; number: string; address?: string }} [initialData]
 * @property {(hotlineId: string) => void} [onDelete]
 * @property {string} role
 */

/**
 * @param {OverlayProps} props
 */
export default function Overlay({ isOpen, onClose, sectionName, onSave, initialData, onDelete, role }) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [address, setAddress] = useState('')
  const [countryCode, setCountryCode] = useState('+63')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      const digits = initialData.number.replace(/\D/g, '')
      if (digits.startsWith('63')) {
        setCountryCode('+63')
        setNumber(digits.slice(2))
      } else {
        setNumber(digits)
      }
      setAddress(initialData.address || '')
    } else {
      setName('')
      setNumber('')
      setAddress('')
      setCountryCode('+63')
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    if (!name || !number) return
    const fullNumber = `${countryCode}${number.replace(/\D/g, '')}`
    onSave({ name, number: fullNumber, address })
  }

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      if (confirm('Are you sure you want to delete this hotline?')) {
        onDelete(initialData.id)
      }
    }
  }

  const isAdmin = role === 'admin'

  return (
    <div className="overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="overlayContent bg-white p-6 rounded-[30px] shadow-lg w-[400px]">
        <h2 className="text-[#073051] text-[32px] sm:text-[36px] font-bold mb-6">
          {initialData ? (isAdmin ? 'Edit Hotline' : 'Hotline Details') : 'Add Hotline'} – {sectionName}
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Name</label>
            <input
              type="text"
              placeholder="Enter hotline name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#D1D1D1] rounded-lg text-[16px]"
              disabled={!isAdmin}
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-[#073051] mb-2">Hotline Number</label>
            <div className="flex space-x-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border border-[#D1D1D1] rounded-lg focus:outline-none appearance-none"
                disabled={!isAdmin}
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
                disabled={!isAdmin}
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
              disabled={!isAdmin}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-6">
          {isAdmin && initialData && (
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
              {isAdmin ? 'Cancel' : 'Close'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-[#1E86DA] text-white rounded-[15px] hover:bg-[#1478C9] transition-colors duration-200"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}