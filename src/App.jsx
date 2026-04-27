import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { translations } from './data/translations'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problems from './components/Problems'
import Solution from './components/Solution'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import WhyMedon from './components/WhyMedon'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'
import AdminPanel from './components/AdminPanel'
import { isSocialTraffic } from './utils/trafficSource'
import WhatsAppButton from './components/WhatsAppButton'
import SeoHead from './components/SeoHead'

const AUTO_MODAL_SHOWN_KEY = 'medon_social_auto_modal_shown'

function LandingPage({ lang, setLang, t, openModal }) {
  useEffect(() => {
    if (!isSocialTraffic()) {
      return
    }

    if (localStorage.getItem(AUTO_MODAL_SHOWN_KEY) === 'true') {
      return
    }

    const timer = window.setTimeout(() => {
      localStorage.setItem(AUTO_MODAL_SHOWN_KEY, 'true')
      openModal()
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [openModal])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-inter">
      <Navbar t={t} lang={lang} setLang={setLang} openModal={openModal} />
      <Hero t={t} openModal={openModal} />
      <Problems t={t} />
      <Solution t={t} />
      <HowItWorks t={t} />
      <Stats t={t} />
      <WhyMedon t={t} />
      <Testimonials t={t} />
      <Contact t={t} />
      <FAQ t={t} />
      <Footer t={t} />
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('hy')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const t = translations[lang]

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <Router>
      <SeoHead lang={lang} />
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              lang={lang} 
              setLang={setLang} 
              t={t} 
              openModal={openModal} 
            />
          } 
        />
        <Route path="/3zdadmin" element={<AdminPanel />} />
        <Route path="/3dzadmin" element={<AdminPanel />} />
      </Routes>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        t={t} 
      />
      <WhatsAppButton />
    </Router>
  )
}
