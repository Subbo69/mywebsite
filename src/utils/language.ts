export const detectLanguage = () => {
  const lang = navigator.language.split("-")[0]

  if (["en", "de", "fr"].includes(lang)) {
    return lang
  }

  return "en"
}
