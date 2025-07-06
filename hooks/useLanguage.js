import { useEffect, useContext } from "react";
import i18n from "i18next";
import { AuthContext } from "../context/AuthContext";
import { getLocales } from "expo-localization";

const useLanguage = () => {
  const {
    settings,
    languageLocale,
    setLanguage,
    setLanguageLocale,
    setStorageCheckedForLang,
  } = useContext(AuthContext);

  useEffect(() => {
    const initLanguage = async () => {
      if (!languageLocale) {
        const userLocale = getLocales();
        if (userLocale) setLanguageLocale(userLocale[0]?.languageCode);
      }
    };

    initLanguage();
  }, [languageLocale, setLanguageLocale]);

  useEffect(() => {
    const changeLanguage = async () => {
      try {
        const currentLang = settings?.lang || languageLocale;
        if (currentLang) {
          await i18n.changeLanguage(currentLang);
        }
      } catch (error) {
        console.log("Error changing language:", error);
      } finally {
        setStorageCheckedForLang(true);
      }
    };

    changeLanguage();
  }, [settings?.lang, languageLocale]);

  return null;
};

export default useLanguage;
