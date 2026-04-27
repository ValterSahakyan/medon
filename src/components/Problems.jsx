import { Layout, Users, Calendar, ClipboardList, Shield, Zap } from 'lucide-react'

export default function Problems({ t }) {
  const icons = [
    <Layout className="w-8 h-8 text-blue-500" />,
    <Users className="w-8 h-8 text-cyan-500" />,
    <Calendar className="w-8 h-8 text-purple-500" />,
    <ClipboardList className="w-8 h-8 text-indigo-500" />,
    <Shield className="w-8 h-8 text-blue-600" />,
    <Zap className="w-8 h-8 text-yellow-500" />
  ]

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:mb-6 md:text-5xl">
            {t.problems.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            {t.problems.subtitle}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {t.problems.items.map((item, idx) => (
            <div key={idx} className="glass-card flex flex-col items-center rounded-2xl p-6 text-center sm:p-8">
              <div className="mb-5 rounded-2xl bg-slate-50 p-3 sm:mb-6 sm:p-4">
                {icons[idx % icons.length]}
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-900 sm:mb-4 sm:text-xl">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
