import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_NAMES, Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: Language[] = ['en', 'hi', 'bn', 'ta', 'te'];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#12365B] hover:bg-gray-50 rounded-lg transition-colors">
        <Globe className="w-4 h-4" />
        <span>{LANGUAGE_NAMES[language]}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                language === lang ? 'bg-[#20B6A0]/10 text-[#20B6A0] font-semibold' : 'text-gray-700'
              }`}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
