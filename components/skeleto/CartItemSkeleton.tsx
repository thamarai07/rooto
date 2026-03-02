"use client"

export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-28 h-28 rounded-xl bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex justify-between">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
  )
}