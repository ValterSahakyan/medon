import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer({ t }) {
  const footerLinks = ['#solution', '#how-it-works', '#why-medon', '#contact']

  return (
    <footer className="bg-[#0B0F19] pb-12 pt-16 text-slate-400 sm:pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:mb-20 lg:grid-cols-3 lg:gap-12">
          <div className="col-span-1 lg:col-span-1">
            <img src="/medon-logo1.png" alt="Medon" className="mb-6 h-14 w-auto object-contain sm:mb-8 sm:h-16" />
            <p className="mb-6 leading-relaxed text-slate-500 sm:mb-8">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/people/MedOn/61588994694882/"
                target="_blank"
                rel="noreferrer"
                aria-label="Medon on Facebook"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/medoncrm"
                target="_blank"
                rel="noreferrer"
                aria-label="Medon on Instagram"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/medonam"
                target="_blank"
                rel="noreferrer"
                aria-label="Medon on LinkedIn"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-white sm:mb-8">{t.footer.links.title}</h4>
            <ul className="space-y-4">
              {t.footer.links.items.map((item, idx) => (
                <li key={idx}>
                  <a href={footerLinks[idx] || '#contact'} className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-white sm:mb-8">{t.footer.contact.title}</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center">
                <Phone size={16} className="text-blue-500" />
                <a href={`tel:${t.footer.contact.phone}`} className="hover:text-white transition-colors">{t.footer.contact.phone}</a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={16} className="text-blue-500" />
                <a href={`mailto:${t.footer.contact.email}`} className="hover:text-white transition-colors">{t.footer.contact.email}</a>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin size={16} className="text-blue-500 mt-1" />
                <span>{t.footer.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-slate-800 pt-8 text-center text-xs">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
