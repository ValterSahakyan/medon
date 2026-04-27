import { MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const rawWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER || ''
const whatsappNumber = rawWhatsAppNumber.replace(/\D/g, '')
const whatsappMessage = encodeURIComponent(
  import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hello, I want a consultation about Medon.'
)

export default function WhatsAppButton() {
  const location = useLocation()

  if (!whatsappNumber || location.pathname.includes('admin')) {
    return null
  }

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#1ebe5b] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:bottom-5 sm:right-5 sm:h-16 sm:w-16"
    >
      <MessageCircle size={26} strokeWidth={2.4} className="sm:h-[30px] sm:w-[30px]" />
    </a>
  )
}
