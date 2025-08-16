import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import tl from './locales/tl.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  de: { translation: de },
  it: { translation: it },
  ja: { translation: ja },
  pt: { translation: pt },
  ru: { translation: ru },
  tl: { translation: tl },
  tr: { translation: tr }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;
