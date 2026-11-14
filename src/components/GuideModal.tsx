import React from 'react';
import { BookOpen, Info, Network, Sparkles, X } from 'lucide-react';
import { TRANSLATIONS, type HelpSection, type Language } from '../i18n/translations';
import type { ActiveView, WorkflowStage } from '../types/conceptMap';

interface GuideModalProps {
  open: boolean;
  section: HelpSection;
  language: Language;
  onChangeSection: (section: HelpSection) => void;
  onClose: () => void;
  onJumpToStage: (stage: WorkflowStage, view: ActiveView) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  open,
  section,
  language,
  onChangeSection,
  onClose,
  onJumpToStage,
}) => {
  if (!open) return null;

  const t = TRANSLATIONS[language];
  const m = t.helpModal;

  const currentTitle =
    section === 'about'
      ? m.aboutTitle
      : section === 'understanding'
      ? m.understandingTitle
      : m.howtoTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 id="help-modal-title" className="font-display text-lg font-bold text-slate-900">
            {currentTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={m.close}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => onChangeSection('about')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'about'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t.helpMenu.about}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeSection('understanding')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'understanding'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.helpMenu.understanding}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeSection('howto')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'howto'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t.helpMenu.howto}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {section === 'about' && (
            <div className="space-y-4">
              {m.aboutBody.map((p, idx) => (
                <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="pt-2 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900">{m.aboutHighlightsTitle}</h3>
                <ul className="space-y-2">
                  {m.aboutHighlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-600 flex items-start gap-2.5 leading-relaxed"
                    >
                      <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {section === 'understanding' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{m.understandingIntro}</p>
              <div className="space-y-3">
                {m.understandingPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">{pt.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pt.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'howto' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{m.howtoIntro}</p>
              <div className="space-y-3">
                {m.howtoSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex items-start gap-3"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-700 mt-0.5 shrink-0">
                      {st.step}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">{st.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{st.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onJumpToStage('define', 'glossary');
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
              >
                {m.goGlossary}
              </button>
              <button
                type="button"
                onClick={() => {
                  onJumpToStage('map', 'map');
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
              >
                {m.goMap}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              {m.gotIt}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
