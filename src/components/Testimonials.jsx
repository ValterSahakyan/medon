import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

export default function Testimonials({ t }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const totalItems = t.testimonials.items.length

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + totalItems) % totalItems)
  }

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % totalItems)
  }

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:mb-6 md:text-5xl">
            {t.testimonials.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="md:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {t.testimonials.items.map((review, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-1">
                  <div className="glass-card relative rounded-3xl p-6">
                    <div className="mb-5 flex gap-1 text-yellow-400">
                      {[...Array(review.stars || 5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="mb-6 text-base italic leading-relaxed text-slate-600">
                      "{review.text}"
                    </p>
                    <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                      <div className="flex h-12 w-12 min-h-12 min-w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        {review.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{review.name}</h4>
                        <p className="text-sm text-slate-500">{review.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center justify-center gap-2">
              {t.testimonials.items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === activeIndex ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="hidden gap-5 md:grid md:grid-cols-3 lg:gap-8">
          {t.testimonials.items.map((review, idx) => (
            <div key={idx} className="glass-card relative rounded-3xl p-6 sm:p-8 lg:p-10">
              <div className="mb-5 flex gap-1 text-yellow-400 sm:mb-6">
                {[...Array(review.stars || 5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="mb-6 text-base italic leading-relaxed text-slate-600 sm:mb-8 sm:text-lg">
                "{review.text}"
              </p>
              <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                <div className="flex h-12 w-12 min-h-12 min-w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
