const SOCIAL_SOURCES = [
  { match: ['instagram.com', 'l.instagram.com'], label: 'Instagram' },
  { match: ['facebook.com', 'm.facebook.com', 'l.facebook.com', 'fb.com'], label: 'Facebook' },
  { match: ['linkedin.com', 'lnkd.in'], label: 'LinkedIn' },
  { match: ['t.co', 'twitter.com', 'x.com'], label: 'X' },
  { match: ['tiktok.com'], label: 'TikTok' }
]

const SEARCH_ENGINES = [
  { match: ['google.'], label: 'Google' },
  { match: ['bing.com'], label: 'Bing' },
  { match: ['yandex.'], label: 'Yandex' },
  { match: ['yahoo.com'], label: 'Yahoo' },
  { match: ['duckduckgo.com'], label: 'DuckDuckGo' }
]

function findMatchedSource(hostname, sources) {
  const normalizedHost = hostname.toLowerCase()
  return sources.find(({ match }) =>
    match.some((entry) => normalizedHost.includes(entry))
  )
}

function normalizeUtmSource(value) {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  const socialMatch = findMatchedSource(normalized, SOCIAL_SOURCES)
  if (socialMatch) {
    return socialMatch.label
  }

  const searchMatch = findMatchedSource(normalized, SEARCH_ENGINES)
  if (searchMatch) {
    return `${searchMatch.label} Search`
  }

  return value.trim()
}

export function detectTrafficSource() {
  const params = new URLSearchParams(window.location.search)
  const utmSource = normalizeUtmSource(params.get('utm_source'))
  const utmMedium = params.get('utm_medium')?.trim() || null
  const utmCampaign = params.get('utm_campaign')?.trim() || null

  if (utmSource) {
    return {
      channel: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      referrer: document.referrer || null,
      landingPath: window.location.pathname
    }
  }

  if (!document.referrer) {
    return {
      channel: 'Direct',
      medium: null,
      campaign: null,
      referrer: null,
      landingPath: window.location.pathname
    }
  }

  let referrerHost = ''
  try {
    referrerHost = new URL(document.referrer).hostname
  } catch {
    referrerHost = document.referrer
  }

  const socialMatch = findMatchedSource(referrerHost, SOCIAL_SOURCES)
  if (socialMatch) {
    return {
      channel: socialMatch.label,
      medium: 'social',
      campaign: null,
      referrer: document.referrer,
      landingPath: window.location.pathname
    }
  }

  const searchMatch = findMatchedSource(referrerHost, SEARCH_ENGINES)
  if (searchMatch) {
    return {
      channel: `${searchMatch.label} Search`,
      medium: 'organic',
      campaign: null,
      referrer: document.referrer,
      landingPath: window.location.pathname
    }
  }

  return {
    channel: 'Referral',
    medium: 'referral',
    campaign: null,
    referrer: document.referrer,
    landingPath: window.location.pathname
  }
}

export function isSocialTraffic() {
  const { channel, medium } = detectTrafficSource()

  if (medium === 'social') {
    return true
  }

  return SOCIAL_SOURCES.some(({ label }) => label === channel)
}
