import { Check, X } from 'lucide-react'

export default function WhyMedon({ t }) {
  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24" id="why-medon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:mb-6 md:text-5xl">
            {t.whyMedon.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            {t.whyMedon.subtitle}
          </p>
        </div>
        
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 md:p-12">
            <h3 className="mb-6 border-b pb-4 text-xl font-bold text-slate-400 sm:mb-8 sm:text-2xl">
              {t.whyMedon.generic.label}
            </h3>
            <ul className="space-y-4">
              {t.whyMedon.generic.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start text-slate-500">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 shadow-2xl shadow-blue-200 sm:p-8 md:p-12">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Check size={120} className="text-white" />
            </div>
            <h3 className="relative z-10 mb-6 border-b border-white/20 pb-4 text-xl font-bold text-white sm:mb-8 sm:text-2xl">
              {t.whyMedon.medon.label}
            </h3>
            <ul className="space-y-4 relative z-10">
              {t.whyMedon.medon.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start text-white">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
