import { SavedAddress } from "@/app/addresses/page";
import { MapPin, Edit, Trash2, Home, Briefcase, Heart, Star, Phone, Mail } from "lucide-react";

interface AddressCardProps {
    address: SavedAddress;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
}

const LABEL_CONFIG = {
    home: {
        icon: Home,
        color: "text-blue-600 bg-blue-100",
        label: "Home"
    },
    work: {
        icon: Briefcase,
        color: "text-purple-600 bg-purple-100",
        label: "Work"
    },
    other: {
        icon: Heart,
        color: "text-pink-600 bg-pink-100",
        label: "Other"
    }
};

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
    const labelConfig = LABEL_CONFIG[address.label];
    const LabelIcon = labelConfig.icon;

    return (
        <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
            address.isDefault ? 'border-green-500' : 'border-gray-200'
        }`}>
            {/* Header */}
            <div className={`p-4 ${address.isDefault ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full ${labelConfig.color} flex items-center justify-center`}>
                            <LabelIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{address.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${labelConfig.color}`}>
                                {labelConfig.label}
                            </span>
                        </div>
                    </div>
                    {address.isDefault && (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-green-600" />
                            Default
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                            {address.flatNo && <p className="font-medium">{address.flatNo}</p>}
                            <p>{address.fullAddress}</p>
                            {address.landmark && (
                                <p className="text-gray-500 text-xs mt-1">Near: {address.landmark}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{address.phoneNumber}</span>
                    </div>

                    {address.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{address.email}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                    {!address.isDefault && (
                        <button
                            onClick={onSetDefault}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                        >
                            <Star className="w-4 h-4" />
                            Set Default
                        </button>
                    )}
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}