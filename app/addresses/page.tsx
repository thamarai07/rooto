'use client'

import { useState, useEffect } from "react";
import {
    MapPin, Plus, Edit, Trash2, Home, Briefcase, Heart,
    Loader2, Check, X, Search, Navigation
} from "lucide-react";
import AddressCard from "@/components/addresses/AddressCard";
import AddressFormModal from "@/components/addresses/AddressFormModal";
import DeleteConfirmModal from "@/components/addresses/DeleteConfirmModal";
import Header from "@/components/header";
import Footer from "@/components/footer";

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api";


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface SavedAddress {
    id: number;
    customer_id: number;
    name: string;
    phoneNumber: string;
    email?: string;
    flatNo: string;
    landmark?: string;
    fullAddress: string;
    label: "home" | "work" | "other";
    coordinates?: {
        lat: number;
        lng: number;
    };
    isDefault: boolean;
    created_at: string;
    updated_at: string;
}

// 🔥 API Response Type (what the backend actually returns)
interface APIAddress {
    id: number;
    customer_id: number;
    name: string;
    phone: string;  // Different field name
    email?: string;
    flat_no: string;  // Different field name
    landmark?: string;
    full_address: string;  // Different field name
    label: string;  // Capitalized values
    latitude?: number;
    longitude?: number;
    is_default: number;  // 0 or 1, not boolean
    created_at: string;
    updated_at: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getUserId = (): number => {
    if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                return user.id || 1;
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }
    return 1;
};

// 🔥 Transform API response to frontend format
const transformAPIAddress = (apiAddress: APIAddress): SavedAddress => {
    return {
        id: apiAddress.id,
        customer_id: apiAddress.customer_id,
        name: apiAddress.name,
        phoneNumber: apiAddress.phone,  // 🔥 Map phone -> phoneNumber
        email: apiAddress.email,
        flatNo: apiAddress.flat_no,  // 🔥 Map flat_no -> flatNo
        landmark: apiAddress.landmark,
        fullAddress: apiAddress.full_address,  // 🔥 Map full_address -> fullAddress
        label: apiAddress.label.toLowerCase() as "home" | "work" | "other",  // 🔥 Convert to lowercase
        coordinates: apiAddress.latitude && apiAddress.longitude ? {
            lat: apiAddress.latitude,
            lng: apiAddress.longitude
        } : undefined,
        isDefault: apiAddress.is_default === 1,  // 🔥 Convert 0/1 to boolean
        created_at: apiAddress.created_at,
        updated_at: apiAddress.updated_at
    };
};

// 🔥 Transform frontend data to API format (for updates)
const transformToAPIFormat = (address: Partial<SavedAddress>) => {
    return {
        name: address.name,
        phone: address.phoneNumber,  // 🔥 Map back
        email: address.email,
        flat_no: address.flatNo,  // 🔥 Map back
        landmark: address.landmark,
        full_address: address.fullAddress,  // 🔥 Map back
        label: address.label ? address.label.charAt(0).toUpperCase() + address.label.slice(1) : 'Home',  // 🔥 Capitalize
        is_default: address.isDefault ? 1 : 0  // 🔥 Convert boolean to number
    };
};

// ============================================================================
// MAIN ADDRESSES PAGE
// ============================================================================
export default function AddressesPage() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);

    // Toast notification
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        show: false,
        message: '',
        type: 'success'
    });

    // Fetch addresses
    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const customerId = getUserId();
            console.log("🔍 Fetching addresses for customer:", customerId);

            const response = await fetch(`${API_BASE}/get_addresses.php?customerId=${customerId}`);
            const data = await response.json();

            console.log("📦 API Response:", data);

            if (data.success) {
                // 🔥 Transform API data to frontend format
                const transformedAddresses = (data.data || []).map((addr: APIAddress) =>
                    transformAPIAddress(addr)
                );

                console.log("✅ Transformed addresses:", transformedAddresses);
                setAddresses(transformedAddresses);

                if (transformedAddresses.length === 0) {
                    console.warn("⚠️ No addresses found");
                }
            } else {
                console.error("❌ API returned success: false");
                showToast('Failed to load addresses', 'error');
            }
        } catch (error) {
            console.error('❌ Error fetching addresses:', error);
            showToast('Error loading addresses', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Toast notification helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Handle add address
    const handleAddAddress = async (addressData: Partial<SavedAddress>) => {
        try {
            const customerId = getUserId();

            // 🔥 Transform to API format
            const apiData = transformToAPIFormat(addressData);

            const response = await fetch(`${API_BASE}/save_address.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    ...apiData
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Address added successfully!', 'success');
                setShowAddModal(false);
                fetchAddresses();
            } else {
                showToast(data.message || 'Failed to add address', 'error');
            }
        } catch (error) {
            console.error('Error adding address:', error);
            showToast('Error adding address', 'error');
        }
    };

    // Handle edit address
    const handleEditAddress = async (addressData: Partial<SavedAddress>) => {
        try {
            // 🔥 Transform to API format
            const apiData = transformToAPIFormat(addressData);

            const response = await fetch(`${API_BASE}/update_address.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedAddress?.id,
                    ...apiData
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Address updated successfully!', 'success');
                setShowEditModal(false);
                setSelectedAddress(null);
                fetchAddresses();
            } else {
                showToast(data.message || 'Failed to update address', 'error');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            showToast('Error updating address', 'error');
        }
    };

    // Handle delete address
    const handleDeleteAddress = async () => {
        if (!selectedAddress) return;

        try {
            const customerId = getUserId();
            const response = await fetch(`${API_BASE}/delete_address.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedAddress.id,
                    customer_id: customerId
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Address deleted successfully!', 'success');
                setShowDeleteModal(false);
                setSelectedAddress(null);
                fetchAddresses();
            } else {
                showToast(data.message || 'Failed to delete address', 'error');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            showToast('Error deleting address', 'error');
        }
    };

    // Handle set default
    const handleSetDefault = async (addressId: number) => {
        try {
            const customerId = getUserId();
            const response = await fetch(`${API_BASE}/set_default_address.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: addressId,
                    customer_id: customerId
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Default address updated!', 'success');
                fetchAddresses();
            } else {
                showToast(data.message || 'Failed to set default', 'error');
            }
        } catch (error) {
            console.error('Error setting default:', error);
            showToast('Error setting default address', 'error');
        }
    };

    // Filter addresses
    const filteredAddresses = addresses.filter(addr =>
        addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🔥 Debug: Log current state


    // Empty state
    if (!isLoading && addresses.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900">My Addresses</h1>
                            <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-16 h-16 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Addresses Added</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Add your delivery addresses to make checkout faster and easier!
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Address
                            </button>
                        </div>
                    </div>

                    {/* Add Modal */}
                    {showAddModal && (
                        <AddressFormModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onSubmit={handleAddAddress}
                            title="Add New Address"
                        />
                    )}
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>

            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">My Addresses</h1>
                                <p className="text-gray-600 mt-2">
                                    Manage your delivery addresses ({addresses.length} {addresses.length === 1 ? 'address' : 'addresses'})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Address
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search addresses by name, location, or label..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-full mb-3" />
                                    <div className="h-10 bg-gray-200 rounded mt-6" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Addresses Grid */}
                            {filteredAddresses.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAddresses.map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={() => {
                                                setSelectedAddress(address);
                                                setShowEditModal(true);
                                            }}
                                            onDelete={() => {
                                                setSelectedAddress(address);
                                                setShowDeleteModal(true);
                                            }}
                                            onSetDefault={() => handleSetDefault(address.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">No addresses found matching your search</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Modals */}
                    {showAddModal && (
                        <AddressFormModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onSubmit={handleAddAddress}
                            title="Add New Address"
                        />
                    )}

                    {showEditModal && selectedAddress && (
                        <AddressFormModal
                            isOpen={showEditModal}
                            onClose={() => {
                                setShowEditModal(false);
                                setSelectedAddress(null);
                            }}
                            onSubmit={handleEditAddress}
                            initialData={selectedAddress}
                            title="Edit Address"
                        />
                    )}

                    {showDeleteModal && selectedAddress && (
                        <DeleteConfirmModal
                            isOpen={showDeleteModal}
                            onClose={() => {
                                setShowDeleteModal(false);
                                setSelectedAddress(null);
                            }}
                            onConfirm={handleDeleteAddress}
                            addressName={selectedAddress.name}
                            addressLabel={selectedAddress.label}
                        />
                    )}

                    {/* Toast Notification */}
                    {notification.show && (
                        <div className="fixed top-20 right-4 z-[10001] animate-slideIn">
                            <div className={`px-6 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-600' :
                                notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                                }`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === 'success' ? 'bg-green-200' :
                                    notification.type === 'error' ? 'bg-red-200' : 'bg-blue-200'
                                    }`} />
                                <span>{notification.message}</span>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
            </div>
            <Footer />
        </>
    );
}