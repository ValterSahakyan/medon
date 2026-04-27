import { useRef, useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { detectTrafficSource } from '../utils/trafficSource'
import RecaptchaWidget from './RecaptchaWidget'

export default function ContactModal({ isOpen, onClose, t }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaRef = useRef(null)

  if (!isOpen) return null

  const currentStep = t.modal.steps[step]
  const isLastStep = step === t.modal.steps.length - 1

  const handleNext = async (e) => {
    e.preventDefault()
    if (isLastStep) {
      if (!recaptchaToken) {
        alert('Please complete reCAPTCHA.')
        return
      }

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
          source: 'Modal',
          trafficSource: detectTrafficSource(),
          recaptchaToken
        })
        })
        const responseData = await response.json()

        if (response.ok) {
          if (responseData.mailStatus === 'disabled' || responseData.mailStatus === 'failed') {
            alert(`Lead saved, but email was not sent. ${responseData.mailError || ''}`.trim())
          }
          setIsSubmitted(true)
        } else {
          throw new Error(responseData.error || 'Failed to submit')
        }
      } catch (err) {
        console.error('Submission error:', err)
        alert(err.message || 'Failed to send request. Please try again.')
        recaptchaRef.current?.reset()
      } finally {
        setSubmitting(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handlePrev = () => setStep(step - 1)

  const handleChange = (id, value) => {
    setFormData({ ...formData, [id]: value })
  }

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setFormData({})
      setIsSubmitted(false)
      setSubmitting(false)
      setRecaptchaToken('')
      return
    }
  }, [isOpen])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
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
            <button 
              onClick={onClose}
              className="btn-primary w-full py-4 mt-8"
            >
              {t.modal.close}
            </button>
          </div>
        ) : (
          <div className="flex max-h-[calc(100vh-1.5rem)] flex-col sm:max-h-[calc(100vh-3rem)]">
            <div className="p-6 pb-5 sm:p-8 sm:pb-6 md:p-12 md:pb-6">
              <h2 className="mb-2 pr-10 text-2xl font-black text-slate-900 md:text-3xl">
                {t.modal.title}
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                {t.modal.subtitle}
              </p>
              
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

            <form onSubmit={handleNext} className="flex min-h-0 flex-1 flex-col px-6 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-12">
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                    {step + 1}. {currentStep.title}
                  </h3>
                  
                  {currentStep.questions.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        {q.label}
                      </label>
                      {q.type === 'textarea' ? (
                        <textarea
                          required
                          placeholder={q.placeholder}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleChange(q.id, e.target.value)}
                          className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none min-h-[100px] resize-none"
                        />
                      ) : (
                        <input
                          required
                          type={q.type}
                          placeholder={q.placeholder}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleChange(q.id, e.target.value)}
                          className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none"
                        />
                      )}
                    </div>
                  ))}
                  {isLastStep ? (
                    <RecaptchaWidget
                      ref={recaptchaRef}
                      onTokenChange={setRecaptchaToken}
                      className="pt-2"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:mt-8 sm:flex-row sm:gap-4 sm:pt-6 md:mt-12">
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
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
