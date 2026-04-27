export default function HowItWorks({ t }) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:mb-6 md:text-5xl">
            {t.howItWorks.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {t.howItWorks.steps.map((step, idx) => (
            <div key={idx} className="group relative rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-xl sm:p-8">
              <div className="mb-4 text-4xl font-black text-blue-600/10 transition-colors group-hover:text-blue-600/20 sm:mb-6 sm:text-5xl">
                {step.num}
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-900 sm:mb-4 sm:text-xl">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
