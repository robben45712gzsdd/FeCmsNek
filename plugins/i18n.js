import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

Vue.use(VueI18n);

export default ({ app }, inject) => {
  let userLocale = localStorage.getItem("selectedLanguage");

  if (userLocale === "en") {
    userLocale = "us";
  }

  if (!userLocale) {
    const browserLang = navigator.language.toLowerCase();
    userLocale = browserLang.startsWith("en") ? "us" : "vi";
  }

  const i18n = new VueI18n({
    locale: userLocale,
    fallbackLocale: "us",
    messages: { us: en, vi },
    silentTranslationWarn: true, 
    silentFallbackWarn: true, 
  });
  
  app.i18n = i18n;   
  inject("i18n", i18n); 
};
