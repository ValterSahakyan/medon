import { useState } from 'react'
import { detectTrafficSource } from '../utils/trafficSource'

export default function Contact({ t }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          lang: t.lang,
          source: 'Footer Form',
          trafficSource: detectTrafficSource()
        })
      })
      const responseData = await response.json()

      if (response.ok) {
        if (responseData.mailStatus === 'disabled' || responseData.mailStatus === 'failed') {
          alert(`Lead saved, but email was not sent. ${responseData.mailError || ''}`.trim())
        }
        setIsSubmitted(true)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (err) {
      console.error('Submission error:', err)
      alert('Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-stretch justify-between gap-8 rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-200 sm:p-8 md:p-12 lg:flex-row lg:items-center lg:gap-12 lg:p-16">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-3xl font-extrabold sm:mb-6 md:text-5xl">
              {t.contact.title}
            </h2>
            <p className="text-base text-blue-100 opacity-90 sm:text-lg">
              {t.contact.subtitle}
            </p>
            
            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              {t.contact.info.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center text-sm font-medium">
                  <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-8 lg:w-96">
            {isSubmitted ? (
              <div className="space-y-4 py-10 text-center sm:py-12">
                <div className="text-4xl">✅</div>
                <h3 className="text-xl font-bold">{t.contact.form.success}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.name}
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t.contact.form.namePlaceholder} 
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 placeholder:text-white/40 text-white focus:bg-white/20 focus:border-white/40 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.email}
                  </label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 placeholder:text-white/40 text-white focus:bg-white/20 focus:border-white/40 transition-all outline-none mb-4"
                  />
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.phone}
                  </label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder={t.contact.form.phonePlaceholder} 
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 placeholder:text-white/40 text-white focus:bg-white/20 focus:border-white/40 transition-all outline-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50">
                  {submitting ? t.contact.form.submitting : t.contact.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
