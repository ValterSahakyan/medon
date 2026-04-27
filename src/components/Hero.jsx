import { ArrowRight, Play } from 'lucide-react'

export default function Hero({ t, openModal }) {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-32 lg:pt-48">
      {/* Background elements */}
      <div className="hero-blob top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50" />
      <div className="hero-blob bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-indigo-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Column 1: Text & Buttons */}
          <div className="relative z-10 space-y-6 text-left sm:space-y-8">
            <h1 className="text-3xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t.hero.title1} <br />
              <span className="text-blue-600">{t.hero.title2}</span>
            </h1>
            
            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-xl">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-4">
              <button 
                onClick={openModal}
                className="btn-primary flex w-full items-center justify-center gap-3 px-6 py-4 text-base sm:w-auto sm:px-8 sm:text-lg"
              >
                {t.hero.cta1}
                <ArrowRight size={20} />
              </button>
              <a href="#how-it-works" className="btn-secondary flex w-full items-center justify-center gap-3 px-6 py-4 text-base sm:w-auto sm:px-8 sm:text-lg">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Play size={18} fill="currentColor" />
                </div>
                {t.hero.cta2}
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-3 sm:gap-8 sm:pt-10">
              {[t.hero.stat1, t.hero.stat2, t.hero.stat3].map((stat, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 px-4 py-4 sm:bg-transparent sm:px-0 sm:py-0">
                  <p className="text-2xl font-black text-blue-600">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-4 lg:mt-0">
            <div className="relative z-20 rounded-2xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] border border-slate-200 transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="/dashboard.png" 
                alt="Medon Dashboard" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="absolute top-1/4 right-[-10px] z-10 hidden w-[88%] translate-y-8 rotate-2 overflow-hidden rounded-2xl border border-slate-200 opacity-90 shadow-2xl sm:block lg:right-[-80px] lg:translate-y-12">
              <img 
                src="/dashboard1.png" 
                alt="Medon Dashboard Alt" 
                className="w-full h-auto"
              />
            </div>

            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse delay-700" />
          </div>
        </div>
      </div>
    </section>
  )
}
