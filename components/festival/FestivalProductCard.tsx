"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Minus, Check } from "lucide-react"
import type { FestivalProduct, FestivalUnit } from "@/lib/festivals.api"
import type { CartLine } from "./festivalCart"
import AddToCartButton from "./AddToCartButton"

interface Props {
  product: FestivalProduct
  line: CartLine | null // present when this product is already in the cart
  busy: boolean
  onAdd: (unit: string, qty: number) => void
  onSetQty: (unit: string, qty: number) => void
}

const roundQty = (n: number, step: number) =>
  Math.round((Number(n) || 0) / step) * step

const fmtQty = (q: number, unit: FestivalUnit) => {
  if (unit.unit === "kg") {
    if (q > 0 && q < 1) return `${Math.round(q * 1000)} g`
    return `${Number(q.toFixed(2))} KG`
  }
  return `${Math.round(q)} ${q === 1 ? unit.label.replace(/s$/, "") : unit.label}`
}

export default function FestivalProductCard({
  product,
  line,
  busy,
  onAdd,
  onSetQty,
}: Props) {
  const units = product.units
  const defaultUnit =
    units.find((u) => u.is_default) || units[0] || {
      unit: "kg",
      label: "KG",
      price: product.final_price,
      base_price: product.price_per_kg,
      step: 0.25,
      min: 0.25,
      max: null,
      is_default: true,
    }

  // While the item is in the cart the unit is fixed to what was added.
  const activeUnitKey = line?.unit ?? null
  const [pickedUnitKey, setPickedUnitKey] = useState(defaultUnit.unit)
  const unitKey = activeUnitKey ?? pickedUnitKey
  const unit: FestivalUnit =
    units.find((u) => u.unit === unitKey) || defaultUnit

  const stock = Number(product.stock) || 0
  const outOfStock = stock <= 0

  // Pre-add quantity selector state (only matters before the item is in cart)
  const [draftQty, setDraftQty] = useState(unit.min)

  // keep draft valid when unit changes
  const effectiveDraft = useMemo(() => {
    let q = roundQty(draftQty, unit.step)
    if (q < unit.min) q = unit.min
    if (unit.max != null && q > unit.max) q = unit.max
    return q
  }, [draftQty, unit])

  const inCartQty = line?.quantity ?? 0
  const shownQty = line ? inCartQty : effectiveDraft
  const lineTotal = unit.price * shownQty

  const changeUnit = (key: string) => {
    setPickedUnitKey(key)
    const u = units.find((x) => x.unit === key)
    if (u) setDraftQty(u.min)
  }

  const stepQty = (dir: 1 | -1) => {
    const base = line ? inCartQty : effectiveDraft
    let next = roundQty(base + dir * unit.step, unit.step)
    if (next < 0) next = 0
    if (unit.max != null && next > unit.max) next = unit.max
    if (line) {
      onSetQty(unit.unit, next) // 0 => remove (handled upstream)
    } else {
      if (next < unit.min) next = unit.min
      setDraftQty(next)
    }
  }

  const unitName = unit.label.replace(/s$/, "")

  return (
    <div
      className={`bg-white rounded-xl flex flex-col h-full overflow-hidden transition-shadow duration-200 ${
        line
          ? "shadow-[0_2px_10px_rgba(22,163,74,0.20)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.32)]"
          : "shadow-[0_1px_6px_rgba(0,0,0,0.09)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
      }`}
    >
      {/* image (no hover zoom) */}
      <Link href={product.url} className="block">
        <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image"
            }}
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-gray-800 bg-white px-2 py-0.5 rounded-full shadow-sm">
                Out of stock
              </span>
            </div>
          )}
          {!outOfStock && product.low_stock && (
            <span className="absolute top-1.5 left-1.5 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Low stock
            </span>
          )}
          {product.has_discount && (
            <span className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
              {Math.round(product.discount_percent)}% OFF
            </span>
          )}
          {line && (
            <span className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[9px] font-bold rounded-full pl-1 pr-1.5 py-0.5 shadow-sm flex items-center gap-0.5">
              <Check className="w-3 h-3" strokeWidth={3} /> In cart
            </span>
          )}
        </div>
      </Link>

      {/* content */}
      <div className="flex flex-col flex-1 p-2 sm:p-2.5 gap-1.5">
        <Link href={product.url}>
          <h3 className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2rem]">
            {product.name}
          </h3>
        </Link>

        {/* unit toggle — only when the product genuinely has >1 unit */}
        {units.length > 1 && (
          <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
            {units.map((u) => {
              const active = unitKey === u.unit
              const locked = !!line && !active
              return (
                <button
                  key={u.unit}
                  disabled={locked}
                  onClick={() => !locked && changeUnit(u.unit)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-bold transition ${
                    active
                      ? "bg-green-600 text-white shadow-sm"
                      : locked
                      ? "bg-white text-gray-500 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:text-green-700 hover:shadow-sm"
                  }`}
                >
                  {u.label}
                </button>
              )
            })}
          </div>
        )}

        {/* price */}
        <div className="flex items-baseline flex-wrap gap-x-1 gap-y-0">
          <span className="text-[16px] sm:text-[17px] leading-none font-black text-gray-900">
            ₹{Number(unit.price.toFixed(2))}
          </span>
          <span className="text-[11px] text-gray-600 font-bold">/{unitName}</span>
          {product.has_discount && (
            <span className="text-[11px] text-gray-400 font-semibold line-through">
              ₹{Number(unit.base_price.toFixed(2))}
            </span>
          )}
        </div>

        {/* stepper + add */}
        <div className="mt-auto pt-0.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => stepQty(-1)}
              disabled={busy || (!line && shownQty <= unit.min)}
              aria-label="Decrease"
              className="w-7 h-7 grid place-items-center rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
            <div className="flex-1 text-center text-[12px] font-extrabold text-gray-900 tabular-nums">
              {fmtQty(shownQty, unit)}
            </div>
            <button
              onClick={() => stepQty(1)}
              disabled={
                busy ||
                outOfStock ||
                (unit.max != null && shownQty + unit.step > unit.max)
              }
              aria-label="Increase"
              title={
                unit.max != null && shownQty + unit.step > unit.max
                  ? `Only ${unit.max} ${unit.label} available`
                  : undefined
              }
              className="w-7 h-7 grid place-items-center rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md bg-green-600 text-white px-2 py-0.5">
            <span className="text-[10px] font-bold text-green-50">
              {fmtQty(shownQty, unit)}
            </span>
            <span className="text-[11px] font-black tabular-nums">
              ₹{Number(lineTotal.toFixed(2))}
            </span>
          </div>

          {line ? (
            <button
              onClick={() => onSetQty(unit.unit, 0)}
              disabled={busy}
              className="w-full py-1.5 rounded-lg text-[11px] font-bold border border-red-300 text-red-600 hover:bg-red-50 active:scale-95 transition disabled:opacity-50"
            >
              Remove from cart
            </button>
          ) : (
            <AddToCartButton
              onClick={() => onAdd(unit.unit, effectiveDraft)}
              busy={busy}
              disabled={outOfStock}
            />
          )}
        </div>
      </div>
    </div>
  )
}
