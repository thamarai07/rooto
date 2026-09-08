"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Check, Loader2 } from "lucide-react"
import { spawnLeaves } from "./festivalLeafLayer"
import styles from "./AddToCartButton.module.css"

interface Props {
  onClick: () => void
  busy?: boolean
  disabled?: boolean // e.g. out of stock
  label?: string
}

export default function AddToCartButton({
  onClick,
  busy = false,
  disabled = false,
  label = "Add to Cart",
}: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const [flash, setFlash] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    []
  )

  const handleClick = () => {
    if (busy || disabled) return

    onClick() // real cart add — unchanged behaviour

    const el = btnRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      spawnLeaves(r.left + r.width / 2, r.bottom, 8)
    }

    setFlash(false)
    // next frame so the CSS animation restarts on rapid clicks
    requestAnimationFrame(() => setFlash(true))
    setJustAdded(true)
    timers.current.push(setTimeout(() => setJustAdded(false), 1200))
    timers.current.push(setTimeout(() => setFlash(false), 1600))
  }

  return (
    <div className={styles.wrap}>
      <span className={`${styles.flash} ${flash ? styles.flashShow : ""}`}>
        Added to cart
      </span>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        disabled={busy || disabled}
        aria-label={label}
        className={styles.btn}
      >
        <span className={styles.icon}>
          {busy ? (
            <Loader2 className={styles.spin} />
          ) : justAdded ? (
            <Check strokeWidth={3} />
          ) : (
            <Plus strokeWidth={3} />
          )}
        </span>
        <span className={styles.label}>{disabled ? "Out of stock" : label}</span>
        <span className={styles.trail} aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </span>
      </button>
    </div>
  )
}
