"use client"

import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'

interface OrderNotesProps {
  onSave?: (notes: string) => void
  initialValue?: string
}

export default function OrderNotes({ onSave, initialValue = '' }: OrderNotesProps) {
  const [notes, setNotes] = useState(initialValue)

  const handleSave = () => {
    if (onSave) {
      onSave(notes)
    }
  }

  const handleClear = () => {
    setNotes('')
  }

  const characterLimit = 500
  const isNearLimit = notes.length > characterLimit * 0.8

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-green-300 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-800">Special Instructions</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Add delivery instructions or special requests for the delivery executive
      </p>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, characterLimit))}
            placeholder="E.g., Please ring the doorbell twice, leave at front door, etc."
            className="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-400 focus:bg-white rounded-xl p-4 outline-none transition resize-none text-gray-800"
            rows={4}
          />

          {/* Character Count */}
          <div className={`absolute bottom-3 right-3 text-xs font-semibold ${
            isNearLimit ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {notes.length}/{characterLimit}
          </div>
        </div>

        {/* Quick Options */}
        <div className="grid grid-cols-2 gap-2">
          {[
            '🔔 Ring doorbell twice',
            '🚪 Leave at door',
            '⏰ Call before delivery',
            '🎁 Gift wrapping'
          ].map(option => (
            <button
              key={option}
              onClick={() => {
                if (!notes.includes(option)) {
                  setNotes(prev => prev ? prev + '\n' + option : option)
                }
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 text-sm font-medium rounded-lg transition-all border border-gray-200 hover:border-green-300"
            >
              {option}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {notes && (
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-4 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={!notes}
              className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
            >
              Save Notes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}