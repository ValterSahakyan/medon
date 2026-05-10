import { useRef, useState, useEffect } from 'react'
import { User, Mail, Phone, Ticket, CheckCircle2, X } from 'lucide-react'
import { detectTrafficSource } from '../utils/trafficSource'
import RecaptchaWidget from './RecaptchaWidget'

export default function Contact({ t }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', promoCode: '' })
  const [validCodes, setValidCodes] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const recaptchaRef = useRef(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/promo-codes`)
      .then(r => r.ok ? r.json() : [])
      .then(codes => {
        if (Array.isArray(codes)) {
          setValidCodes(codes)
        }
      })
      .catch(() => {})
  }, [])

  const matchedPromo = Array.isArray(validCodes)
    ? validCodes.find(c => c.code === formData.promoCode.trim().toUpperCase())
    : null
  const isValidPromo = formData.promoCode.trim() !== '' && !!matchedPromo

  const validate = () => {
    const v = t.validation
    const e = {}
    if (!formData.name.trim()) e.name = v.required
    if (!formData.email.trim()) e.email = v.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = v.invalidEmail
    if (!formData.phone.trim()) e.phone = v.required
    if (!recaptchaToken) e.recaptcha = v.recaptcha
    return e
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    try {
      setSubmitting(true)
      setErrors({})
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lang: t.lang,
          source: 'Footer Form',
          trafficSource: detectTrafficSource(),
          recaptchaToken
        })
      })
      const responseData = await response.json()
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error(responseData.error || 'Failed to submit')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setErrors({ submit: t.validation.submitError })
      recaptchaRef.current?.reset()
      setRecaptchaToken('')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-xl px-4 py-3.5 pl-12 placeholder:text-white/30 text-white transition-all outline-none border ${
      hasError
        ? 'bg-red-500/10 border-red-400/50 ring-4 ring-red-400/10 focus:border-red-400'
        : 'bg-white/5 border-white/10 focus:bg-white/10 focus:ring-4 focus:ring-white/5 focus:border-white/30'
    }`

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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-100/70 group-focus-within:text-white transition-colors">
                    {t.contact.form.name} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t.contact.form.namePlaceholder}
                      className={inputClass(errors.name)}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs font-bold text-red-300 flex items-center gap-1.5 px-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-100/70 group-focus-within:text-white transition-colors">
                    {t.contact.form.email} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t.contact.form.emailPlaceholder}
                      className={inputClass(errors.email)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-bold text-red-300 flex items-center gap-1.5 px-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-100/70 group-focus-within:text-white transition-colors">
                    {t.contact.form.phone} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t.contact.form.phonePlaceholder}
                      className={inputClass(errors.phone)}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs font-bold text-red-300 flex items-center gap-1.5 px-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Promo code */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-100/70 group-focus-within:text-white transition-colors">
                    {t.contact.form.promoCode}
                  </label>
                  <div className="relative">
                    <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                      placeholder={t.contact.form.promoCodePlaceholder}
                      className={`${inputClass(false)} uppercase tracking-widest pr-12`}
                    />
                    {formData.promoCode.trim() !== '' && (
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isValidPromo ? 'scale-110' : 'scale-100'}`}>
                        {isValidPromo ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-blue-900 shadow-sm">
                            <CheckCircle2 size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-400/20 text-red-300">
                            <X size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.promoCode.trim() !== '' && (
                    <p className={`text-xs font-bold flex items-center gap-1.5 px-1 ${isValidPromo ? 'text-cyan-200' : 'text-red-300/80'}`}>
                      <span className={`w-1 h-1 rounded-full ${isValidPromo ? 'bg-cyan-200' : 'bg-red-300'}`} />
                      {isValidPromo
                        ? matchedPromo.discount ? `${matchedPromo.discount}% ${t.contact.form.promoCodeValid}` : t.contact.form.promoCodeValid
                        : t.contact.form.promoCodeInvalid}
                    </p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center py-2">
                  <RecaptchaWidget
                    ref={recaptchaRef}
                    onTokenChange={(token) => {
                      setRecaptchaToken(token)
                      if (token && errors.recaptcha) setErrors(prev => ({ ...prev, recaptcha: '' }))
                    }}
                  />
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <p className="text-xs font-bold text-red-300 bg-red-500/10 rounded-xl px-4 py-3">
                    {errors.submit}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50"
                >
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
