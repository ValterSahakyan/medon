import { useRef, useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { detectTrafficSource } from '../utils/trafficSource'
import RecaptchaWidget from './RecaptchaWidget'

export default function ContactModal({ isOpen, onClose, t }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [promoCode, setPromoCode] = useState('')
  const [validCodes, setValidCodes] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaRef = useRef(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/promo-codes`)
      .then(r => r.json())
      .then(codes => setValidCodes(codes))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setFormData({})
      setPromoCode('')
      setErrors({})
      setSubmitError('')
      setIsSubmitted(false)
      setSubmitting(false)
      setRecaptchaToken('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentStep = t.modal.steps[step]
  const isLastStep = step === t.modal.steps.length - 1
  const matchedPromo = validCodes.find(c => c.code === promoCode.trim().toUpperCase())
  const isValidPromo = promoCode.trim() !== '' && !!matchedPromo

  const validateStep = () => {
    const v = t.validation
    const e = {}
    for (const q of currentStep.questions) {
      const val = (formData[q.id] || '').trim()
      if (!val) {
        e[q.id] = v.required
      } else if (q.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        e[q.id] = v.invalidEmail
      }
    }
    if (isLastStep && !recaptchaToken) {
      e.recaptcha = v.recaptcha
    }
    return e
  }

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }))
  }

  const handleNext = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validateStep()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    if (isLastStep) {
      try {
        setSubmitting(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            promoCode: promoCode.trim().toUpperCase() || undefined,
            lang: t.lang,
            source: 'Modal',
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
        setSubmitError(t.validation.submitError)
        recaptchaRef.current?.reset()
        setRecaptchaToken('')
        setErrors(prev => ({ ...prev, recaptcha: '' }))
      } finally {
        setSubmitting(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    setErrors({})
    setSubmitError('')
    setStep(step - 1)
  }

  const inputClass = (hasError) =>
    `w-full rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 transition-all outline-none ${
      hasError
        ? 'bg-red-50 ring-2 ring-red-400/40 border border-red-300'
        : 'bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600'
    }`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300 sm:max-h-[calc(100vh-3rem)] sm:rounded-[2.5rem]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 text-slate-400 transition-colors hover:text-slate-900 sm:right-6 sm:top-6"
        >
          <X size={24} />
        </button>

        {isSubmitted ? (
          <div className="space-y-5 p-6 text-center sm:space-y-6 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 animate-bounce sm:mb-8 sm:h-20 sm:w-20">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{t.modal.successTitle}</h2>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              {t.modal.successSubtitle}
            </p>
            <button onClick={onClose} className="btn-primary w-full py-4 mt-8">
              {t.modal.close}
            </button>
          </div>
        ) : (
          <div className="flex max-h-[calc(100vh-1.5rem)] flex-col sm:max-h-[calc(100vh-3rem)]">
            <div className="p-6 pb-5 sm:p-8 sm:pb-6 md:p-12 md:pb-6">
              <h2 className="mb-2 pr-10 text-2xl font-black text-slate-900 md:text-3xl">
                {t.modal.title}
              </h2>
              <p className="text-slate-500 text-sm md:text-base">{t.modal.subtitle}</p>
              <div className="mt-6 flex gap-2 sm:mt-8">
                {t.modal.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i <= step ? 'bg-blue-600' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleNext} noValidate className="flex min-h-0 flex-1 flex-col px-6 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-12">
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                    {step + 1}. {currentStep.title}
                  </h3>

                  {currentStep.questions.map((q) => (
                    <div key={q.id}>
                      <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                        {q.label}
                      </label>
                      {q.type === 'textarea' ? (
                        <textarea
                          placeholder={q.placeholder}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleChange(q.id, e.target.value)}
                          className={`${inputClass(errors[q.id])} min-h-[100px] resize-none`}
                        />
                      ) : (
                        <input
                          type={q.type}
                          placeholder={q.placeholder}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleChange(q.id, e.target.value)}
                          className={inputClass(errors[q.id])}
                        />
                      )}
                      {errors[q.id] && (
                        <p className="text-xs mt-1.5 ml-1 font-bold text-red-500">{errors[q.id]}</p>
                      )}
                    </div>
                  ))}

                  {isLastStep && (
                    <>
                      {/* Promo code */}
                      <div>
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                          {t.modal.promoCode}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t.modal.promoCodePlaceholder}
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className={`${inputClass(false)} uppercase tracking-widest pr-10`}
                          />
                          {promoCode.trim() !== '' && (
                            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black ${isValidPromo ? 'text-green-500' : 'text-red-400'}`}>
                              {isValidPromo ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                        {promoCode.trim() !== '' && (
                          <p className={`text-xs ml-1 mt-1.5 font-bold ${isValidPromo ? 'text-green-500' : 'text-red-400'}`}>
                            {isValidPromo
                              ? matchedPromo.discount ? `${matchedPromo.discount}% ${t.modal.promoCodeValid}` : t.modal.promoCodeValid
                              : t.modal.promoCodeInvalid}
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
                          className="pt-2"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:mt-8 sm:pt-6 md:mt-12">
                {/* reCAPTCHA / submit errors pinned above buttons */}
                {(errors.recaptcha || submitError) && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    {errors.recaptcha || submitError}
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 sm:flex-1"
                  >
                    <ChevronLeft size={20} />
                    {t.modal.prev}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center justify-center gap-2 px-6 py-4 disabled:opacity-50 sm:flex-[2]"
                >
                  {submitting ? '...' : (isLastStep ? t.modal.submit : t.modal.next)}
                  {!isLastStep && !submitting && <ChevronRight size={20} />}
                </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
