import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import zh from './zh.json';

const dicts = { en, de, fr, es, zh } as const;

export type Locale = keyof typeof dicts;
export const locales = Object.keys(dicts) as Locale[];
export const defaultLocale: Locale = 'en';

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang in dicts) return lang as Locale;
  return defaultLocale;
}

export function useTranslations(locale: Locale) {
  return function t(key: string) {
    const keys = key.split('.');
    let result: any = dicts[locale];
    
    for (const k of keys) {
      if (result && k in result) {
        result = result[k];
      } else {
        // Fallback to English
        result = dicts[defaultLocale];
        for (const fallbackK of keys) {
          if (result && fallbackK in result) {
            result = result[fallbackK];
          } else {
            return key; // Return the key if it doesn't exist in English either
          }
        }
        break;
      }
    }
    
    return result as string;
  }
}

// Helper to get relative path for a locale
export function getRelativePath(url: URL, locale: Locale): string {
  const currentLocale = getLocaleFromUrl(url);
  const pathname = url.pathname;
  
  // Remove current locale prefix if it exists and is not default
  let basePage = pathname;
  if (currentLocale !== defaultLocale) {
    basePage = pathname.replace(`/${currentLocale}`, '');
  }
  
  if (basePage === '') basePage = '/';
  
  // Add new locale prefix if it's not default
  if (locale === defaultLocale) {
    return basePage;
  } else {
    return `/${locale}${basePage === '/' ? '' : basePage}`;
  }
}
