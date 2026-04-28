import { useRef, useState, useEffect } from 'react'
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
      .then(r => r.json())
      .then(codes => setValidCodes(codes))
      .catch(() => {})
  }, [])

  const matchedPromo = validCodes.find(c => c.code === formData.promoCode.trim().toUpperCase())
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
    `w-full rounded-xl px-4 py-3 placeholder:text-white/40 text-white transition-all outline-none ${
      hasError
        ? 'bg-red-500/20 ring-1 ring-red-400/70'
        : 'bg-white/10 focus:bg-white/20 focus:ring-1 focus:ring-white/40'
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
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={t.contact.form.namePlaceholder}
                    className={inputClass(errors.name)}
                  />
                  {errors.name && (
                    <p className="text-xs mt-1.5 font-bold text-red-300">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t.contact.form.emailPlaceholder}
                    className={inputClass(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-xs mt-1.5 font-bold text-red-300">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t.contact.form.phonePlaceholder}
                    className={inputClass(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="text-xs mt-1.5 font-bold text-red-300">{errors.phone}</p>
                  )}
                </div>

                {/* Promo code */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">
                    {t.contact.form.promoCode}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                      placeholder={t.contact.form.promoCodePlaceholder}
                      className={`${inputClass(false)} uppercase tracking-widest pr-10`}
                    />
                    {formData.promoCode.trim() !== '' && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black ${isValidPromo ? 'text-green-300' : 'text-red-300'}`}>
                        {isValidPromo ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                  {formData.promoCode.trim() !== '' && (
                    <p className={`text-xs mt-1.5 font-bold ${isValidPromo ? 'text-green-300' : 'text-red-300/80'}`}>
                      {isValidPromo
                        ? matchedPromo.discount ? `${matchedPromo.discount}% ${t.contact.form.promoCodeValid}` : t.contact.form.promoCodeValid
                        : t.contact.form.promoCodeInvalid}
                    </p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div>
                  <RecaptchaWidget
                    ref={recaptchaRef}
                    onTokenChange={(token) => {
                      setRecaptchaToken(token)
                      if (token && errors.recaptcha) setErrors(prev => ({ ...prev, recaptcha: '' }))
                    }}
                  />
                  {errors.recaptcha && (
                    <p className="text-xs mt-1.5 font-bold text-red-300">{errors.recaptcha}</p>
                  )}
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
