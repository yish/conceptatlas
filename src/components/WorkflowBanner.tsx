import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  Globe,
  Network,
  Sparkles,
} from 'lucide-react';
import { getStarterMaps } from '../data/starterMaps';
import { LANGUAGE_META, TRANSLATIONS, type Language } from '../i18n/translations';
import type { ActiveView, ConceptMapData, WorkflowStage } from '../types/conceptMap';

interface WorkflowBannerProps {
  language: Language;
  map: ConceptMapData;
  activeView: ActiveView;
  stage: WorkflowStage;
  onChangeLanguage: (lang: Language) => void;
  onChangeStage: (stage: WorkflowStage) => void;
  onChangeView: (view: ActiveView) => void;
  onUpdateTitle: (title: string) => void;
  onUpdateFocusQuestion: (question: string) => void;
  onLoadStarter: (starterId: string) => void;
  onOpenAssistant: () => void;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  language,
  map,
  activeView,
  stage,
  onChangeLanguage,
  onChangeStage,
  onChangeView,
  onUpdateTitle,
  onUpdateFocusQuestion,
  onLoadStarter,
  onOpenAssistant,
}) => {
  const t = TRANSLATIONS[language].banner;
  const isRtl = LANGUAGE_META[language].dir === 'rtl';
  const [starterMenuOpen, setStarterMenuOpen] = useState(false);

  const starterMaps = getStarterMaps(language);

  const totalConcepts = map.concepts.length;
  const definedCount = map.concepts.filter((c) => c.definition.trim().length > 0).length;
  const missingDefinitions = totalConcepts - definedCount;
  const linkedConceptIds = new Set<string>();
  for (const l of map.links) {
    linkedConceptIds.add(l.sourceId);
    linkedConceptIds.add(l.targetId);
  }
  const unlinkedCount = map.concepts.filter((c) => !linkedConceptIds.has(c.id)).length;
  const placedCount = map.concepts.filter((c) => c.placed).length;

  const step1Done = totalConcepts >= 2 && missingDefinitions === 0;
  const step2Done = totalConcepts >= 2 && map.links.length >= 1 && unlinkedCount === 0;
  const step3Done = placedCount === totalConcepts && totalConcepts >= 2 && map.links.length >= 1;

  const stages: Array<{
    id: WorkflowStage;
    num: string;
    label: string;
    hint: string;
    done: boolean;
  }> = [
    {
      id: 'define',
      num: '01',
      label: t.stage1Label,
      hint: t.definedRatio(definedCount, totalConcepts),
      done: step1Done,
    },
    {
      id: 'relate',
      num: '02',
      label: t.stage2Label,
      hint: t.linksMapped(map.links.length),
      done: step2Done,
    },
    {
      id: 'map',
      num: '03',
      label: t.stage3Label,
      hint: t.onCanvasRatio(placedCount, totalConcepts),
      done: step3Done,
    },
  ];

  const handleStageClick = (nextStage: WorkflowStage) => {
    onChangeStage(nextStage);
    if (nextStage === 'map') {
      onChangeView('map');
    } else {
      onChangeView('glossary');
    }
  };

  const StepArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-4">
        {/* Top Row: Editable Map Title, Focus Question & Controls + Language Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <input
                type="text"
                aria-label="Concept map title"
                value={map.title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="font-display text-xl font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 w-full max-w-xl transition-colors"
              />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 shrink-0">
                {t.focusQuestionLabel}
              </span>
              <input
                type="text"
                aria-label="Focus question"
                value={map.focusQuestion}
                onChange={(e) => onUpdateFocusQuestion(e.target.value)}
                placeholder={t.focusQuestionPlaceholder}
                className="text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 w-full max-w-2xl transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Language Selector */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="language-selector" className="sr-only">
                {t.languageLabel}
              </label>
              <select
                id="language-selector"
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="text-xs font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="he">{LANGUAGE_META.he.nativeName}</option>
                <option value="ar">{LANGUAGE_META.ar.nativeName}</option>
                <option value="en">{LANGUAGE_META.en.nativeName}</option>
              </select>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setStarterMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.templates}</span>
              </button>
              {starterMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setStarterMenuOpen(false)}
                  />
                  <div className="absolute end-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1.5">
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-500 border-b border-slate-100">
                      {t.loadStarterHeader}
                    </div>
                    {starterMaps.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onLoadStarter(s.id);
                          setStarterMenuOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="truncate font-medium">{s.title}</span>
                        <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
                          {s.concepts.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.aiReviewSuggest}</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Structured 3-Stage Process Bar + View Switcher + Unboxed Metadata */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            {stages.map((s, idx) => {
              const isActive = stage === s.id;
              return (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleStageClick(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-start transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-medium tabular-nums ${
                        s.done
                          ? 'text-emerald-700'
                          : isActive
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        s.num
                      )}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{s.label}</span>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {s.hint}
                      </span>
                    </div>
                  </button>
                  {idx < stages.length - 1 && (
                    <StepArrow className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-5 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
              <span>{t.conceptsCount(totalConcepts)}</span>
              <span aria-hidden="true">·</span>
              <span>{t.linksCount(map.links.length)}</span>
              {missingDefinitions > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-medium">
                    {t.missingDefCount(missingDefinitions)}
                  </span>
                </>
              )}
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
              role="tablist"
              aria-label="Workspace view"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeView === 'glossary'}
                onClick={() => {
                  onChangeView('glossary');
                  if (stage === 'map') onChangeStage('relate');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeView === 'glossary'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.glossaryTab}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === 'map'}
                onClick={() => {
                  onChangeView('map');
                  onChangeStage('map');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeView === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>{t.mapTab}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
