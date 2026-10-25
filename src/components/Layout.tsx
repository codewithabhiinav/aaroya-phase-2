import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { path: '/dashboard', label: t('dashboard') },
    { path: '/history', label: t('caseHistory') },
    { path: '/roadmap', label: t('roadmap') },
    { path: '/settings', label: t('settings') },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8]">
      {showNav && (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#12365B] text-lg hidden sm:block">Aarogya Scribe</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-[#12365B] text-white'
                        : 'text-gray-600 hover:text-[#12365B] hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <LanguageSwitcher />
                <Link
                  to="/case/create"
                  className="ml-2 px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium hover:bg-[#1a9e8a] transition-colors"
                >
                  {t('newCase')}
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-[#12365B] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="py-2 border-t border-gray-100">
                <LanguageSwitcher />
              </div>
              <Link
                to="/case/create"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium text-center"
              >
                {t('newCase')}
              </Link>
            </div>
          )}
        </nav>
      )}
      <main>{children}</main>
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            Developed by Abhinav · <span className="font-medium text-[#12365B]">code_with_abhinav</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">All rights reserved by Team HealthNova.</p>
        </div>
      </footer>
    </div>
  );
}
