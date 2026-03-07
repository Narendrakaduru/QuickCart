import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Shield, Calendar, Package, Heart, LogOut, MapPin, Plus, Edit2, Trash2, Home, Building, Phone } from 'lucide-react';
import { logout } from '../slices/authSlice';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../slices/addressSlice';
import { useNavigate } from 'react-router-dom';
import AddressModal from '../components/AddressModal';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { addresses, isLoading } = useSelector((state) => state.addresses);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to be logged in to view this page.</h2>
        <button 
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenModal = (address = null) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
  };

  const handleAddressSubmit = async (formData) => {
    if (selectedAddress) {
      await dispatch(updateAddress({ id: selectedAddress._id, addressData: formData }));
    } else {
      await dispatch(addAddress(formData));
    }
    handleCloseModal();
  };

  const handleDeleteClick = (id) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      dispatch(deleteAddress(addressToDelete));
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    }
  };

  const getAddressIcon = (type) => {
      switch(type) {
          case 'Office': return <Building size={16} className="text-blue-600" />;
          case 'Home': 
          default:
              return <Home size={16} className="text-blue-600" />;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 md:h-48 relative">
            <div className="absolute -bottom-12 left-8 border-4 border-white rounded-full bg-white shadow-lg overflow-hidden group">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 flex items-center justify-center text-blue-600">
                <User size={48} className="md:hidden" />
                <User size={64} className="hidden md:block" />
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-500 font-medium flex items-center">
                <Mail size={16} className="mr-2" /> {user.email}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={handleLogout}
                className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 border border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition uppercase text-xs tracking-widest"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Account Details</h3>
              <div className="space-y-5">
                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Shield size={20} className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Role</p>
                    <p className="font-semibold capitalize text-sm">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Calendar size={20} className="mr-3 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Joined</p>
                    <p className="font-semibold text-sm">March 2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Quick Links</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/cart')}
                  className="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg text-gray-700 font-medium group transition-all"
                >
                  <Package size={18} className="mr-3 text-gray-400 group-hover:text-blue-500 transition" />
                  My Orders
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center p-3 hover:bg-pink-50 rounded-lg text-gray-700 font-medium group transition-all"
                >
                  <Heart size={18} className="mr-3 text-gray-400 group-hover:text-pink-500 transition" />
                  Wishlist
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area - Addresses */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <MapPin size={22} className="mr-2 text-blue-600" /> My Addresses
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your saved shipping and billing addresses.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 md:px-4 md:py-2 rounded-lg text-sm font-semibold transition-colors flex items-center whitespace-nowrap shadow-sm"
                    >
                        <Plus size={18} className="md:mr-1" />
                        <span className="hidden md:inline">Add Address</span>
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                         <div className="flex justify-center items-center py-12">
                             <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                         </div>
                    ) : addresses && addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <div 
                                    key={address._id} 
                                    className={`relative p-5 rounded-xl border-2 transition-all ${address.isDefault ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    {address.isDefault && (
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                                            Default
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2 mb-3">
                                         <div className="p-2 bg-blue-100 rounded-lg">
                                             {getAddressIcon(address.addressType)}
                                         </div>
                                         <div>
                                            <h4 className="font-bold text-gray-800 leading-tight">{address.fullName}</h4>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{address.addressType}</span>
                                         </div>
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-gray-600 mb-6">
                                        <p>{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zip}</p>
                                        <p>{address.country}</p>
                                        <p className="pt-2 font-medium text-gray-700 flex items-center">
                                            <Phone size={14} className="mr-2 text-gray-400"/> {address.phone}
                                        </p>
                                    </div>

                                    <div className="absolute bottom-4 right-4 flex space-x-2">
                                        <button 
                                            onClick={() => handleOpenModal(address)}
                                            className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors tooltip"
                                            title="Edit Address"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(address._id)}
                                            className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors tooltip"
                                            title="Delete Address"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <div className="bg-white p-4 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                <MapPin size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No addresses saved</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                                You haven't added any shipping or billing addresses yet. Add one now for faster checkout.
                            </p>
                            <button 
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                            >
                                <Plus size={18} className="mr-1" /> Add your first address
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <AddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddressSubmit}
        address={selectedAddress}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Address?</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 border-2 border-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700 hover:border-red-700 transition-all uppercase tracking-wider shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
