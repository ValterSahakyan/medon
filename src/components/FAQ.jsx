import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function FAQ({ t }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:mb-6 md:text-5xl">
            {t.faq.title}
          </h2>
          <p className="text-base text-slate-500 sm:text-lg">
            {t.lang === 'hy' ? 'Ամենահաճախ տրվող հարցերը մեր ծառայությունների վերաբերյալ:' : 'Самые часто задаваемые вопросы о наших услугах.'}
          </p>
        </div>

        <div className="space-y-4">
          {t.faq.items.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`group border rounded-3xl transition-all duration-300 ${
                  isOpen 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between p-5 text-left outline-none sm:p-6 md:p-8"
                >
                  <span className={`text-base sm:text-lg md:text-xl font-bold transition-colors ${
                    isOpen ? 'text-blue-600' : 'text-slate-900'
                  }`}>
                    {item.q}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-white text-slate-400'
                  }`}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-blue-100/50 p-5 pt-0 text-sm leading-relaxed text-slate-600 sm:p-6 sm:pt-0 md:p-8 md:pt-0 md:text-lg">
                    {item.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
