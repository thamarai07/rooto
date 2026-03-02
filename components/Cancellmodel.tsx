import { CheckCircle, Heart, Gift, ArrowRight, X } from "lucide-react";

interface OrderCancelSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  refundAmount?: number;
  refundInitiated?: boolean;
}

export default function OrderCancelSuccessModal({
  isOpen,
  onClose,
  orderNumber,
  refundAmount,
  refundInitiated = false
}: OrderCancelSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-8 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Cancelled Successfully
          </h2>
          <p className="text-gray-600 text-sm">
            Order #{orderNumber}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Apology Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">We're Sorry to See You Go</span>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We understand that things don't always go as planned. Your satisfaction is our top priority, and we're constantly working to improve our service.
            </p>
          </div>

          {/* Refund Info */}
          {refundInitiated && refundAmount && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">
                    Refund Initiated
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    ₹{refundAmount.toFixed(2)} will be credited to your account within 5-7 business days.
                  </p>
                  <p className="text-xs text-green-600">
                    You'll receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              What Happens Next?
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Your order has been cancelled and won't be delivered</span>
              </li>
              {refundInitiated && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Refund will be processed within 5-7 business days</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>You'll receive an email confirmation shortly</span>
              </li>
            </ul>
          </div>

          {/* Feedback Section */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-900 text-center">
              <strong>💡 Help us improve!</strong><br />
              Your feedback matters. We'd love to know how we can serve you better next time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                onClose();
                // Navigate to contact or feedback page
                window.location.href = '/contact';
              }}
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-xl font-medium transition"
            >
              Share Feedback
            </button>
          </div>

          {/* Reassurance Message */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              We value your trust and are committed to providing you with the best experience. Thank you for choosing us! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}