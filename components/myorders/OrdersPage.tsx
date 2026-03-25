'use client'

import { useState, useEffect } from "react";
import {
    Package, Clock, CheckCircle, XCircle, Truck, ChevronRight,
    MapPin, Calendar, ShoppingBag, RefreshCw, Search, Filter,
    X, Phone, Mail, Download, Loader2
} from "lucide-react";
import OrderCancelSuccessModal from "../Cancellmodel";

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OrderAddress {
    name: string;
    phone: string;
    email?: string;
    fullAddress: string;
    landmark?: string;
    label?: string;
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    items: OrderItem[];
    address: OrderAddress;
    subtotal: number;
    tax: number;
    shipping_charge: number;
    total: number;
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    payment_status: "pending" | "unpaid" | "paid" | "partial" | "failed" | "refunded";
    payment_method: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    delivery_date: string | null;
    estimated_delivery: string | null;
}

interface Pagination {
    page: number;
    totalPages: number;
    total?: number;
}

interface StatusConfig {
    label: string;
    color: string;
    icon: any;
    dotColor: string;
}

type StatusType = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
    pending: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        dotColor: "bg-yellow-500"
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        dotColor: "bg-blue-500"
    },
    processing: {
        label: "Processing",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Package,
        dotColor: "bg-purple-500"
    },
    shipped: {
        label: "Shipped",
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: Truck,
        dotColor: "bg-indigo-500"
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        dotColor: "bg-green-500"
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        dotColor: "bg-red-500"
    }
};

const PAYMENT_STATUS_CONFIG = {
    pending: { label: "Payment Pending", color: "text-yellow-600" },
    unpaid: { label: "Unpaid", color: "text-yellow-600" },
    paid: { label: "Paid", color: "text-green-600" },
    partial: { label: "Partially Paid", color: "text-orange-600" },
    failed: { label: "Payment Failed", color: "text-red-600" },
    refunded: { label: "Refunded", color: "text-gray-600" }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
};

// Get user ID from localStorage
const getUserId = (): number | null => {
    if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                return user.id || null;
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }
    return null;
};

// ============================================================================
// ORDER CARD COMPONENT
// ============================================================================
function OrderCard({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) {
    const statusConfig = STATUS_CONFIG[order.status];
    const StatusIcon = statusConfig.icon;
    const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status];

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">
                                Order #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {getRelativeTime(order.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentConfig.color} bg-gray-100`}>
                            {paymentConfig.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                            <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "https://placehold.co/64x64/e5e7eb/6b7280?text=No+Image";
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                                <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × ₹{parseFloat(item.price.toString()).toFixed(2)}
                                </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                                ₹{parseFloat(item.subtotal.toString()).toFixed(2)}
                            </p>
                        </div>
                    ))}
                    {order.items.length > 2 && (
                        <p className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
                            +{order.items.length - 2} more items
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{parseFloat(order.total.toString()).toFixed(2)}</p>
                    </div>

                    <button
                        onClick={() => onViewDetails(order)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// ORDER DETAILS MODAL
// ============================================================================
function OrderDetailsModal({
    order,
    onClose,
    onCancel,
    onShowSuccessModal  // 🔥 NEW PROP
}: {
    order: Order;
    onClose: () => void;
    onCancel: () => void;
    onShowSuccessModal: (orderNumber: string, refundAmount: number, refundInitiated: boolean) => void;  // 🔥 NEW PROP
}) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [showCancelForm, setShowCancelForm] = useState(false);

    const statusConfig = STATUS_CONFIG[order.status];
    const StatusIcon = statusConfig.icon;
    const customerId = getUserId();

    const handleDownloadInvoice = () => {
        window.open(`${API_BASE}/download_invoice.php?order_id=${order.id}&customer_id=${customerId}`, '_blank');
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert("Please provide a reason for cancellation");
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch(`${API_BASE}/cancel_order.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: order.id,
                    customer_id: customerId,
                    reason: cancelReason
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // 🔥 Close this modal first
                onClose();

                // 🔥 Then show success modal (passed from parent)
                onShowSuccessModal(
                    order.order_number,
                    order.total,
                    data.refund_initiated || false
                );

                // Refresh orders list
                onCancel();
            } else {
                alert(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            alert('Error cancelling order');
        } finally {
            setIsCancelling(false);
        }
    };

    const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Order Details</h2>
                            <p className="text-green-100">Order #{order.order_number}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Status Timeline */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Order Status</h3>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color} flex items-center gap-2`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </span>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-center">
                                {(["pending", "confirmed", "processing", "shipped", "delivered"] as StatusType[]).map((status, index) => {
                                    const config = STATUS_CONFIG[status];
                                    const Icon = config.icon;
                                    const statusOrder: StatusType[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
                                    const isActive = statusOrder.indexOf(order.status) >= index;
                                    const isCancelled = order.status === "cancelled";

                                    return (
                                        <div key={status} className="flex-1 flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive && !isCancelled ? config.dotColor : "bg-gray-300"
                                                } text-white mb-2`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <p className={`text-xs font-medium ${isActive && !isCancelled ? "text-gray-900" : "text-gray-400"}`}>
                                                {config.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 -z-10">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{
                                        width: `${((["pending", "confirmed", "processing", "shipped", "delivered"] as StatusType[]).indexOf(order.status) / 4) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {order.estimated_delivery && order.status !== "delivered" && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Estimated Delivery: <strong>{formatDate(order.estimated_delivery)}</strong>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image";
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Quantity: {item.quantity} × ₹{parseFloat(item.price.toString()).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-lg">₹{parseFloat(item.subtotal.toString()).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Delivery Address</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{order.address.name}</p>
                                    <p className="text-gray-700 mt-1">{order.address.fullAddress}</p>
                                    {order.address.landmark && (
                                        <p className="text-gray-600 text-sm mt-1">Landmark: {order.address.landmark}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {order.address.phone}
                                        </p>
                                        {order.address.email && (
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {order.address.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal</span>
                                <span>₹{parseFloat(order.subtotal.toString()).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (8%)</span>
                                <span>₹{parseFloat(order.tax.toString()).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Shipping Charge</span>
                                <span className={order.shipping_charge === 0 ? "text-green-600 font-semibold" : ""}>
                                    {order.shipping_charge === 0 ? "FREE" : `₹${parseFloat(order.shipping_charge.toString()).toFixed(2)}`}
                                </span>
                            </div>
                            <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-green-600">₹{parseFloat(order.total.toString()).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> {order.notes}
                            </p>
                        </div>
                    )}

                    {/* Cancel Order Form */}
                    {showCancelForm && canCancel && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-3">Cancel Order</h4>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation..."
                                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                                rows={3}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={isCancelling}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                                </button>
                                <button
                                    onClick={() => setShowCancelForm(false)}
                                    className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Nevermind
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-200 p-6 bg-gray-50 flex flex-wrap gap-3">
                    <button
                        onClick={handleDownloadInvoice}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        <Download className="w-4 h-4" />
                        Download Invoice
                    </button>
                    {canCancel && !showCancelForm && (
                        <button
                            onClick={() => setShowCancelForm(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 hover:border-red-400 text-red-700 rounded-lg font-medium transition"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN ORDERS PAGE COMPONENT
// ============================================================================
export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1 });

    // 🔥 SUCCESS MODAL STATE (moved to parent)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [cancelledOrderInfo, setCancelledOrderInfo] = useState<{
        orderNumber: string;
        refundAmount: number;
        refundInitiated: boolean;
    } | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const customerId = getUserId();
            if (!customerId) {
                setIsLoading(false);
                return;
            }

            const params = new URLSearchParams({
                customer_id: customerId.toString(),
                status: filterStatus,
                search: searchQuery,
                page: pagination.page.toString(),
                limit: "20"
            });

            const response = await fetch(`${API_BASE}/get_orderssite.php?${params}`);
            const data = await response.json();

            if (data.status === "success") {
                setOrders(data.orders);
                setFilteredOrders(data.orders);
                setPagination({
                    page: data.pagination.page,
                    totalPages: data.pagination.totalPages,
                    total: data.pagination.total
                });
            } else {
                console.error("Error fetching orders:", data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus, searchQuery]);

    const handleRefresh = () => {
        fetchOrders();
    };

    const handleCancelSuccess = () => {
        fetchOrders();
    };

    // 🔥 NEW HANDLER - Show success modal
    const handleShowSuccessModal = (orderNumber: string, refundAmount: number, refundInitiated: boolean) => {
        setCancelledOrderInfo({
            orderNumber,
            refundAmount,
            refundInitiated
        });
        setShowSuccessModal(true);
    };

    if (!isLoading && orders.length === 0 && filterStatus === 'all' && !searchQuery) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You haven't placed any orders yet. Start shopping to see your orders here!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-600 mt-2">Track and manage your orders</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg font-medium transition shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order number or product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px]"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
                                <div className="space-y-3">
                                    <div className="h-16 bg-gray-200 rounded" />
                                    <div className="h-16 bg-gray-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredOrders.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onViewDetails={setSelectedOrder}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No orders found matching your filters</p>
                            </div>
                        )}
                    </>
                )}

                {/* 🔥 ORDER DETAILS MODAL */}
                {selectedOrder && (
                    <OrderDetailsModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onCancel={handleCancelSuccess}
                        onShowSuccessModal={handleShowSuccessModal}  // 🔥 Pass handler
                    />
                )}

                {/* 🔥 SUCCESS MODAL - Rendered at parent level */}
                {showSuccessModal && cancelledOrderInfo && (
                    <OrderCancelSuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            setCancelledOrderInfo(null);
                        }}
                        orderNumber={cancelledOrderInfo.orderNumber}
                        refundAmount={cancelledOrderInfo.refundAmount}
                        refundInitiated={cancelledOrderInfo.refundInitiated}
                    />
                )}
            </div>
        </div>
    );
}