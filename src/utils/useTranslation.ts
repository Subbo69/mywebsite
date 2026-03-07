import { translations } from "./translations"
import { detectLanguage } from "./language"

const lang = detectLanguage()

export const t = (key: keyof typeof translations["en"]) => {
  return translations[lang]?.[key] || translations["en"][key]
}
