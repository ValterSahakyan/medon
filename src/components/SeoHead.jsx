import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://medon.am'
const DEFAULT_IMAGE = `${SITE_URL}/dashboard.png`
const ORGANIZATION_ID = `${SITE_URL}/#organization`

const SEO_BY_LANG = {
  hy: {
    title: 'Medon | CRM և ավտոմատացում բժշկական կլինիկաների համար',
    description:
      'Medon-ը տրամադրում է CRM և ավտոմատացման հատուկ լուծումներ բժշկական կլինիկաների համար Հայաստանում՝ հարցումների կառավարում, follow-up, զանգերի վերահսկում և աճի տեսանելիություն։',
    locale: 'hy_AM',
  },
  ru: {
    title: 'Medon | CRM и автоматизация для медицинских клиник',
    description:
      'Medon предоставляет CRM и индивидуальные решения по автоматизации для медицинских клиник в Армении: управление обращениями, follow-up, контроль звонков и прозрачность роста.',
    locale: 'ru_AM',
  },
}

function upsertMeta(attr, key, content) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel, href, extraAttributes = {}) {
  const selectorParts = [`link[rel="${rel}"]`]
  Object.entries(extraAttributes).forEach(([key, value]) => {
    selectorParts.push(`[${key}="${value}"]`)
  })

  let element = document.head.querySelector(selectorParts.join(''))
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
  Object.entries(extraAttributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertJsonLd(id, data) {
  let element = document.head.querySelector(`script[data-seo-id="${id}"]`)
  if (!element) {
    element = document.createElement('script')
    element.setAttribute('type', 'application/ld+json')
    element.setAttribute('data-seo-id', id)
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

export default function SeoHead({ lang }) {
  const location = useLocation()

  useEffect(() => {
    const isAdminPage = location.pathname.includes('admin')
    const seo = SEO_BY_LANG[lang] || SEO_BY_LANG.hy
    const canonicalUrl = isAdminPage ? `${SITE_URL}${location.pathname}` : `${SITE_URL}/`
    const pageTitle = isAdminPage ? 'Medon Admin Panel' : seo.title
    const pageDescription = isAdminPage
      ? 'Medon admin dashboard for lead management.'
      : seo.description
    const robots = isAdminPage
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

    document.documentElement.lang = lang
    document.title = pageTitle

    upsertMeta('name', 'description', pageDescription)
    upsertMeta('name', 'robots', robots)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'Medon')
    upsertMeta('property', 'og:locale', seo.locale)
    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', pageDescription)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', DEFAULT_IMAGE)
    upsertMeta('property', 'og:image:alt', 'Medon clinic CRM dashboard')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', pageDescription)
    upsertMeta('name', 'twitter:image', DEFAULT_IMAGE)

    upsertLink('canonical', canonicalUrl)
    upsertLink('alternate', `${SITE_URL}/`, { hreflang: 'hy' })
    upsertLink('alternate', `${SITE_URL}/`, { hreflang: 'ru' })
    upsertLink('alternate', `${SITE_URL}/`, { hreflang: 'x-default' })

    if (!isAdminPage) {
      upsertJsonLd('website', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': ORGANIZATION_ID,
            name: 'Medon',
            url: `${SITE_URL}/`,
            logo: `${SITE_URL}/medon-logo1.png`,
            email: 'info@medon.am',
            sameAs: [
              'https://www.facebook.com/people/MedOn/61588994694882/',
              'https://www.instagram.com/medoncrm',
              'https://www.linkedin.com/company/medonam',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: `${SITE_URL}/`,
            name: 'Medon',
            publisher: {
              '@id': ORGANIZATION_ID,
            },
            inLanguage: ['hy', 'ru'],
          },
          {
            '@type': 'Service',
            '@id': `${SITE_URL}/#service`,
            name: lang === 'ru' ? 'CRM и автоматизация для клиник' : 'CRM և ավտոմատացում կլինիկաների համար',
            provider: {
              '@id': ORGANIZATION_ID,
            },
            areaServed: {
              '@type': 'Country',
              name: 'Armenia',
            },
            serviceType:
              lang === 'ru'
                ? 'Индивидуальные CRM и решения по автоматизации для медицинских клиник'
                : 'Բժշկական կլինիկաների համար անհատական CRM և ավտոմատացման լուծումներ',
            url: `${SITE_URL}/`,
          },
        ],
      })
    }
  }, [lang, location.pathname])

  return null
}
