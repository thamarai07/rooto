// Shared full-viewport canvas that renders the falling-leaf burst when a
// festival "Add to Cart" button is clicked. One canvas + one RAF loop for the
// whole page; each button just calls spawnLeaves(x, y). Nothing runs until the
// first click, and everything is client-only + SSR-safe.

import { LEAF_SRCS } from "./leafData"

interface Leaf {
  img: HTMLImageElement
  x: number
  y: number
  scale: number
  vy: number
  gravity: number
  swayAmp: number
  swayFreq: number
  swayPhase: number
  dir: number
  rot: number
  rotV: number
  opacity: number
  age: number
  fadeAt: number
  fadeDur: number
  alive: boolean
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let imgs: HTMLImageElement[] = []
let leaves: Leaf[] = []
let running = false
let dpr = 1

function resize() {
  if (!canvas || !ctx) return
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  canvas.style.width = w + "px"
  canvas.style.height = h + "px"
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function ensure() {
  if (canvas) return
  dpr = window.devicePixelRatio || 1
  canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  canvas.style.cssText =
    "position:fixed;top:0;left:0;pointer-events:none;z-index:9998"
  document.body.appendChild(canvas)
  ctx = canvas.getContext("2d")
  resize()
  window.addEventListener("resize", resize)
  imgs = LEAF_SRCS.map((src) => {
    const im = new Image()
    im.src = src
    return im
  })
}

function makeLeaf(cx: number, cy: number): Leaf {
  const img = imgs[Math.floor(Math.random() * imgs.length)]
  const dir = Math.random() > 0.5 ? 1 : -1
  const spread = (Math.random() - 0.5) * 90
  return {
    img,
    x: cx + spread,
    y: cy - 8 - Math.random() * 26, // slight vertical jitter => leaves trickle
    scale: 1,
    vy: 0.3 + Math.random() * 0.2,
    gravity: 0.003 + Math.random() * 0.003,
    swayAmp: 16 + Math.random() * 28,
    swayFreq: 0.008 + Math.random() * 0.012,
    swayPhase: Math.random() * Math.PI * 2,
    dir,
    rot: (Math.random() - 0.5) * 0.6,
    rotV: (0.003 + Math.random() * 0.007) * dir,
    opacity: 1,
    age: 0,
    fadeAt: 170 + Math.random() * 70,
    fadeDur: 70 + Math.random() * 55,
    alive: true,
  }
}

function loop() {
  if (!ctx || !canvas) {
    running = false
    return
  }
  const w = window.innerWidth
  const h = window.innerHeight
  ctx.clearRect(0, 0, w, h)
  let any = false

  for (let i = leaves.length - 1; i >= 0; i--) {
    const lf = leaves[i]
    if (!lf.alive) {
      leaves.splice(i, 1)
      continue
    }
    lf.age++
    lf.vy += lf.gravity
    lf.y += lf.vy

    const sway = Math.sin(lf.age * lf.swayFreq + lf.swayPhase) * lf.swayAmp * lf.dir
    const dx = lf.x + sway
    const swayD =
      Math.cos(lf.age * lf.swayFreq + lf.swayPhase) * lf.swayFreq * lf.swayAmp
    lf.rot += lf.rotV
    const angle = lf.rot + swayD * 0.28

    if (lf.age > lf.fadeAt) {
      lf.opacity = Math.max(0, 1 - (lf.age - lf.fadeAt) / lf.fadeDur)
      if (lf.opacity <= 0) {
        lf.alive = false
        continue
      }
    }
    if (lf.y > h + 60) {
      lf.alive = false
      continue
    }

    const img = lf.img
    if (img.complete && img.width) {
      const dw = img.width * lf.scale
      const dh = img.height * lf.scale
      ctx.save()
      ctx.translate(dx, lf.y)
      ctx.rotate(angle)
      ctx.globalAlpha = lf.opacity
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
      ctx.restore()
    }
    any = true
  }

  if (any) {
    requestAnimationFrame(loop)
  } else {
    ctx.clearRect(0, 0, w, h)
    running = false
  }
}

/** Drop `count` leaves from screen point (x, y). Safe to call rapidly. */
export function spawnLeaves(x: number, y: number, count = 8): void {
  if (typeof window === "undefined") return
  ensure()
  // Hard cap so a mash of clicks can't grow the pool without bound.
  if (leaves.length > 240) leaves.splice(0, leaves.length - 240)
  for (let i = 0; i < count; i++) leaves.push(makeLeaf(x, y))
  if (!running) {
    running = true
    requestAnimationFrame(loop)
  }
}
