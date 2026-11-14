import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { TRANSLATIONS, type HelpSection, type Language } from '../i18n/translations';
import type { ActiveView } from '../types/conceptMap';

interface TopBarProps {
  language: Language;
  activeView: ActiveView;
  assistantOpen: boolean;
  onSelectView: (view: ActiveView) => void;
  onToggleAssistant: () => void;
  onOpenHelp: (section: HelpSection) => void;
  onOpenExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  activeView,
  assistantOpen,
  onSelectView,
  onToggleAssistant,
  onOpenHelp,
  onOpenExport,
}) => {
  const t = TRANSLATIONS[language];
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setHelpMenuOpen(false);
      }
    };
    if (helpMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [helpMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectView('glossary');
        }}
        className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
      >
        {t.appTitle}
      </a>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectView('glossary')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'glossary'
              ? 'text-blue-700 border-blue-700 font-semibold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {t.nav.glossary}
        </button>
        <button
          type="button"
          onClick={() => onSelectView('map')}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'map'
              ? 'text-blue-700 border-blue-700 font-semibold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {t.nav.map}
        </button>
        <button
          type="button"
          onClick={onToggleAssistant}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            assistantOpen
              ? 'text-blue-700 border-blue-700 font-semibold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {t.nav.assistant}
        </button>

        {/* Help Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-expanded={helpMenuOpen}
            aria-haspopup="menu"
            onClick={() => setHelpMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>{t.nav.help}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {helpMenuOpen && (
            <div
              role="menu"
              className="absolute start-0 mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg z-40 py-1.5 text-start"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpMenuOpen(false);
                  onOpenHelp('about');
                }}
                className="w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {t.helpMenu.about}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpMenuOpen(false);
                  onOpenHelp('understanding');
                }}
                className="w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {t.helpMenu.understanding}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpMenuOpen(false);
                  onOpenHelp('howto');
                }}
                className="w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {t.helpMenu.howto}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Zone 3: 1 primary CTA */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenExport}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {t.nav.importExport}
        </button>
      </div>
    </header>
  );
};
