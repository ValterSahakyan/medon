import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar({ t, lang, setLang, openModal }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: t.nav.services, href: '#solution' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.benefits, href: '#why-medon' },
    { label: t.nav.contact, href: '#contact' },
  ]

  const languages = [
    { 
      code: 'hy', 
      label: 'Հայերեն', 
      flag: '/armenia.png' 
    },
    { 
      code: 'ru', 
      label: 'Русский', 
      flag: '/russia.webp' 
    }
  ]

  const currentLang = languages.find(l => l.code === lang)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-1'
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300">
        <a href="#" className="flex-shrink-0 group">
          <img 
            src="/medon-logo1.png" 
            alt="Medon" 
            className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105" 
          />
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-8">
          <button
            onClick={openModal}
            className="btn-primary py-3 px-8 text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            {t.nav.cta}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all"
            >
              <img src={currentLang.flag} alt={currentLang.label} className="w-7 h-5 object-cover rounded-sm shadow-sm" />
              <ChevronDown size={14} className={`transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code)
                        setLangMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-slate-50 ${
                        lang === l.code ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <img src={l.flag} alt={l.label} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex gap-1.5">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all border ${
                  lang === l.code ? 'bg-blue-50 border-blue-200 shadow-inner' : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                <img src={l.flag} alt={l.label} className="w-5 h-3.5 object-cover rounded-sm" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl bg-white/80 p-2 text-slate-800 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:text-blue-600"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 px-4 pb-6 pt-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-[2rem] border border-slate-200 bg-slate-50 p-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-white px-4 py-4 text-base font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false)
              openModal()
            }}
            className="btn-primary mt-2 py-4 text-center text-base font-bold"
          >
            {t.nav.cta}
          </button>
          </div>
        </div>
      )}
    </header>
  )
}
