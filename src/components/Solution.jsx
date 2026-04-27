import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Solution({ t }) {
  const showcaseImages = [
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseImages.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24" id="solution">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:mb-6 md:text-5xl">
            {t.solution.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            {t.solution.subtitle}
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto group">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-2xl sm:aspect-[16/10] sm:rounded-3xl md:aspect-[16/9] lg:aspect-[16/10]">
            {showcaseImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                  idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Slide ${idx}`} 
                  className="w-full h-full object-contain bg-slate-50" 
                />
              </div>
            ))}
          </div>

          <button 
            onClick={prevSlide}
            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition-all duration-300 hover:bg-blue-600 hover:text-white sm:flex lg:left-0 lg:h-14 lg:w-14 lg:-translate-x-1/2 lg:shadow-2xl lg:opacity-0 lg:group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition-all duration-300 hover:bg-blue-600 hover:text-white sm:flex lg:right-0 lg:h-14 lg:w-14 lg:translate-x-1/2 lg:shadow-2xl lg:opacity-0 lg:group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>

          <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2 sm:mt-10">
            {showcaseImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 transition-all duration-300 rounded-full ${
                  idx === currentIndex ? 'w-10 bg-blue-600' : 'w-2.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:mt-24 lg:gap-8">
          {t.solution.items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg sm:p-8">
              <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
