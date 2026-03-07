export const detectLanguage = () => {
  const browserLang = navigator.language.split("-")[0]

  const supported = ["en", "es", "fr", "de"]

  if (supported.includes(browserLang)) {
    return browserLang
  }

  return "en"
}
