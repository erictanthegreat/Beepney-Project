import React, { useEffect, useState } from 'react'

/**
 * @typedef {Object} Overlay2Props
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} name
 * @property {string} idType
 * @property {string} frontImageUrl
 * @property {string} backImageUrl
 */

/**
 * @param {Overlay2Props} props
 */
export default function Overlay2({ isOpen, onClose, name, idType, frontImageUrl, backImageUrl }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(isOpen)
  }, [isOpen])

  if (!loaded) return null

  return (
    <div className="overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-[30px] shadow-lg w-full max-w-[800px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-[#073051] text-[28px] font-bold mb-2">{name}</h2>

        {/* ID Type */}
        <div className="mb-6">
          <p className="text-gray-700 font-medium text-lg">ID Type: {idType}</p>
        </div>

        {/* Pictures */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Front</p>
            <img
              src={frontImageUrl}
              alt="Front"
              className="w-full h-[500px] object-cover rounded-lg border border-gray-200"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Back</p>
            <img
              src={backImageUrl}
              alt="Back"
              className="w-full h-[500px] object-cover rounded-lg border border-gray-200"
            />
          </div>
        </div>

        {/* Note for confirmation */}
        <div className="mt-6 text-sm text-gray-500">
          For confirmation, you may verify the ID here:{' '}
          <a
            href="https://pwd.doh.gov.ph/tbl_pwd_id_verificationlist.php?fbclid=IwY2xjawMmW7VleHRuA2FlbQIxMABicmlkETFUMVdmRHFWWTMzRUpacnI0AR4brkLDZbqLgu8LRvZEXpNFdMth-sXd-ce_NvKTGzmVPKUJAhIFRxPysZUrcQ_aem_iX5pY3RK7yYMtegiV9-Nkg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            PWD Verification Website
          </a>
        </div>
      </div>
    </div>
  )
}