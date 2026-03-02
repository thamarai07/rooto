import { useState, useEffect } from "react";
import { SavedAddress } from "@/app/addresses/page";
import { X, MapPin, Home, Briefcase, Heart, Loader2, Navigation } from "lucide-react";

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<SavedAddress>) => Promise<void>;
    initialData?: SavedAddress;
    title: string;
}

export default function AddressFormModal({ isOpen, onClose, onSubmit, initialData, title }: AddressFormModalProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        phoneNumber: initialData?.phoneNumber || '',
        email: initialData?.email || '',
        flatNo: initialData?.flatNo || '',
        landmark: initialData?.landmark || '',
        fullAddress: initialData?.fullAddress || '',
        label: initialData?.label || 'home' as 'home' | 'work' | 'other',
        isDefault: initialData?.isDefault || false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phoneNumber: initialData.phoneNumber || '',
                email: initialData.email || '',
                flatNo: initialData.flatNo || '',
                landmark: initialData.landmark || '',
                fullAddress: initialData.fullAddress || '',
                label: initialData.label || 'home',
                isDefault: initialData.isDefault || false
            });
        }
    }, [initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!/^[0-9]{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Enter valid 10-digit number';
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Phone & Email */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="9876543210"
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Flat/House No */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Flat / House No / Building
                            </label>
                            <input
                                type="text"
                                value={formData.flatNo}
                                onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Flat 301, Building A"
                            />
                        </div>

                        {/* Full Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Street Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.fullAddress}
                                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    errors.fullAddress ? 'border-red-500' : 'border-gray-300'
                                }`}
                                rows={3}
                                placeholder="Street name, area, city, state, pincode"
                            />
                            {errors.fullAddress && <p className="text-red-500 text-sm mt-1">{errors.fullAddress}</p>}
                        </div>

                        {/* Landmark */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Near City Mall"
                            />
                        </div>

                        {/* Address Label */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Save As
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'home', icon: Home, label: 'Home', color: 'blue' },
                                    { value: 'work', icon: Briefcase, label: 'Work', color: 'purple' },
                                    { value: 'other', icon: Heart, label: 'Other', color: 'pink' }
                                ].map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = formData.label === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, label: option.value as any })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                                                isSelected
                                                    ? `border-${option.color}-500 bg-${option.color}-50`
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className={`w-6 h-6 ${isSelected ? `text-${option.color}-600` : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${isSelected ? `text-${option.color}-600` : 'text-gray-600'}`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            />
                            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Set as default delivery address
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>Save Address</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}