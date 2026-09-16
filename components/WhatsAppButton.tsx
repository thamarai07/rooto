"use client"

// Site-wide floating WhatsApp contact button. Pure UI, no cart/order/auth
// logic touched — safe to add anywhere without affecting existing flows.
export default function WhatsAppButton() {
  const phone = "919677028737"
  const message = "Hi Rooto! I have a question about ordering fresh fruits."
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="#FFFFFF" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 14.997c0 2.207.6 4.353 1.74 6.23L4 29l7.94-1.706A12.94 12.94 0 0 0 16.004 27C22.63 27 28 21.627 28 14.997 28 8.373 22.63 3 16.004 3Zm0 23.65a10.6 10.6 0 0 1-5.406-1.48l-.387-.23-4.71 1.012 1.013-4.59-.253-.396a10.6 10.6 0 0 1-1.617-5.966c0-5.874 4.783-10.65 10.66-10.65 5.874 0 10.65 4.776 10.65 10.65 0 5.876-4.776 10.65-10.65 10.65Zm5.85-7.98c-.32-.16-1.897-.936-2.19-1.043-.294-.107-.508-.16-.722.16-.213.32-.827 1.043-1.014 1.257-.187.213-.373.24-.694.08-.32-.16-1.35-.497-2.573-1.586-.951-.848-1.593-1.895-1.78-2.215-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.722-1.74-.99-2.383-.26-.626-.526-.541-.722-.55-.187-.008-.4-.01-.614-.01-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.257 3.447 5.467 4.834.764.33 1.36.527 1.825.674.767.244 1.465.21 2.017.127.615-.092 1.897-.775 2.164-1.523.267-.747.267-1.387.187-1.522-.08-.134-.293-.214-.613-.374Z" />
      </svg>
    </a>
  )
}
