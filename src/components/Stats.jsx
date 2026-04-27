export default function Stats({ t }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-12 text-center text-white sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:mb-6 md:text-5xl">{t.stats.title}</h2>
          <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">{t.stats.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {t.stats.items.map((stat, idx) => (
            <div key={idx} className="rounded-3xl border border-white/15 bg-white/10 px-5 py-6 text-center text-white backdrop-blur-sm lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:px-4 lg:py-0 lg:last:border-r-0">
              <div className="mb-2 text-4xl font-black md:text-6xl">{stat.value}</div>
              <div className="mb-2 text-sm font-bold uppercase tracking-widest">
                {stat.label}
              </div>
              <div className="text-xs opacity-70">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
