import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import it from "./it.json";
import de from "./de.json";
import fr from "./fr.json";
import es from "./es.json";
import pt from "./pt.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: en,
    it: it,
    fr: fr,
    es: es,
    de: de,
    pt: pt,
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
