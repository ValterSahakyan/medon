import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
const SCRIPT_ID = 'google-recaptcha-api'

function loadRecaptchaScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA requires a browser environment'))
  }

  if (window.grecaptcha?.render) {
    return Promise.resolve(window.grecaptcha)
  }

  if (window.__recaptchaLoadPromise) {
    return window.__recaptchaLoadPromise
  }

  window.__recaptchaLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.grecaptcha))
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA')))
      return
    }

    window.__onRecaptchaLoaded = () => resolve(window.grecaptcha)

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=__onRecaptchaLoaded'
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.body.appendChild(script)
  })

  return window.__recaptchaLoadPromise
}

const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { theme = 'light', onTokenChange, className = '' },
  ref
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [loadError, setLoadError] = useState('')

  useImperativeHandle(ref, () => ({
    reset() {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current)
      }
      onTokenChange('')
    }
  }), [onTokenChange])

  useEffect(() => {
    let cancelled = false

    if (!SITE_KEY) {
      setLoadError('Missing VITE_RECAPTCHA_SITE_KEY')
      return undefined
    }

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) {
          return
        }

        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (token) => onTokenChange(token),
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => {
            onTokenChange('')
            setLoadError('reCAPTCHA error. Please try again.')
          }
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || 'Failed to load reCAPTCHA')
        }
      })

    return () => {
      cancelled = true
    }
  }, [onTokenChange, theme])

  return (
    <div className={className}>
      <div ref={containerRef} />
      {loadError ? (
        <p className="mt-2 text-sm font-medium text-red-500">{loadError}</p>
      ) : null}
    </div>
  )
})

export default RecaptchaWidget
