import React, { useState } from 'react';
import { X, MapPin, Building, Globe, Hash, User, Phone } from 'lucide-react';

const AddressModal = ({ isOpen, onClose, onSubmit, address = null }) => {
  const defaultFormState = {
    fullName: '',
    addressType: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    isDefault: false,
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [prevAddress, setPrevAddress] = useState(address);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Update state during render when props change instead of using useEffect
  // This avoids cascading renders warning (https://react.dev/learn/you-might-not-need-an-effect)
  if (address !== prevAddress || isOpen !== prevIsOpen) {
    setPrevAddress(address);
    setPrevIsOpen(isOpen);
    
    if (address) {
      setFormData({
        fullName: address.fullName || '',
        addressType: address.addressType || 'Home',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.zip || '',
        country: address.country || '',
        phone: address.phone || '',
        isDefault: address.isDefault || false,
      });
    } else {
      setFormData(defaultFormState);
    }
  }

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="addressForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                     <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

               <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Address Type
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                     <Building size={16} />
                  </span>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Phone Number
              </label>
               <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                     <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Street Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pt-2.5 items-start">
                   <MapPin size={16} />
                </span>
                <textarea
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  placeholder="123 Main St, Apt 4B"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="New York"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  State / Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  ZIP / Postal Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                     <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Country
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                     <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 checked:bg-blue-600 checked:border-transparent transition-all cursor-pointer"
                  />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Set as default shipping address
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="addressForm"
            className="px-6 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            {address ? 'Save Changes' : 'Add Address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
