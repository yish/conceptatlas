import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { LANGUAGE_META, TRANSLATIONS, type Language } from '../i18n/translations';
import type {
  ConceptLink,
  ConceptMapData,
  ConceptNode,
  DefinitionIssue,
  WorkflowStage,
} from '../types/conceptMap';

interface GlossaryViewProps {
  language: Language;
  map: ConceptMapData;
  stage: WorkflowStage;
  selectedConceptId: string | null;
  definitionIssues: DefinitionIssue[];
  onSelectConcept: (id: string | null) => void;
  onAddConcept: (name: string, definition: string, category: string) => string;
  onBatchAddConcepts: (names: string[]) => void;
  onUpdateConcept: (id: string, patch: Partial<ConceptNode>) => void;
  onDeleteConcept: (id: string) => void;
  onAddLink: (sourceId: string, targetId: string, label: string) => void;
  onUpdateLink: (linkId: string, patch: Partial<ConceptLink>) => void;
  onDeleteLink: (linkId: string) => void;
  onGoToMap: (focusConceptId?: string) => void;
  onAdvanceStage: (stage: WorkflowStage) => void;
  onOpenAssistantReview: () => void;
}

type GlossaryFilter = 'all' | 'missing_def' | 'unlinked' | 'flagged';

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  language,
  map,
  stage,
  selectedConceptId,
  definitionIssues,
  onSelectConcept,
  onAddConcept,
  onBatchAddConcepts,
  onUpdateConcept,
  onDeleteConcept,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onGoToMap,
  onAdvanceStage,
  onOpenAssistantReview,
}) => {
  const t = TRANSLATIONS[language].glossary;
  const isRtl = LANGUAGE_META[language].dir === 'rtl';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<GlossaryFilter>('all');
  const [batchMode, setBatchMode] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(t.categoryPlaceholder);
  const [newDefinition, setNewDefinition] = useState('');
  const [batchText, setBatchText] = useState('');

  const [linkDrafts, setLinkDrafts] = useState<
    Record<string, { targetId: string; label: string }>
  >({});

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const issueByConceptName = useMemo(() => {
    const record = new Map<string, DefinitionIssue>();
    for (const issue of definitionIssues) {
      record.set(issue.conceptName.trim().toLowerCase(), issue);
    }
    return record;
  }, [definitionIssues]);

  const byId = useMemo(
    () => new Map(map.concepts.map((c) => [c.id, c])),
    [map.concepts]
  );

  const filteredConcepts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return map.concepts.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      if (!matchesQuery) return false;

      if (filter === 'missing_def') {
        return !c.definition.trim();
      }
      if (filter === 'unlinked') {
        return !map.links.some((l) => l.sourceId === c.id || l.targetId === c.id);
      }
      if (filter === 'flagged') {
        return issueByConceptName.has(c.name.trim().toLowerCase());
      }
      return true;
    });
  }, [map.concepts, map.links, searchQuery, filter, issueByConceptName]);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const createdId = onAddConcept(
      newName.trim(),
      newDefinition.trim(),
      newCategory.trim() || t.categoryPlaceholder
    );
    setNewName('');
    setNewDefinition('');
    onSelectConcept(createdId);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = batchText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    onBatchAddConcepts(names);
    setBatchText('');
    setBatchMode(false);
  };

  const jumpToConcept = (conceptId: string) => {
    onSelectConcept(conceptId);
    const el = itemRefs.current[conceptId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const missingDefsCount = map.concepts.filter((c) => !c.definition.trim()).length;
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;
  const OutArrow = isRtl ? ArrowLeft : ArrowRight;
  const InArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
      {/* Structured Stage Guidance Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-lg font-bold text-slate-900">
            {stage === 'define' ? t.step1Title : t.step2Title}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            {stage === 'define' ? t.step1Desc : t.step2Desc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {stage === 'define' ? (
            <button
              type="button"
              onClick={() => onAdvanceStage('relate')}
              disabled={map.concepts.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <span>{t.nextConnect}</span>
              <ForwardArrow className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGoToMap()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{t.openVisualMap}</span>
              <ForwardArrow className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Add Concept Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {batchMode ? t.seedMultipleTitle : t.addConceptTitle}
          </h2>
          <button
            type="button"
            onClick={() => setBatchMode((v) => !v)}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
          >
            {batchMode ? t.switchSingle : t.switchBatch}
          </button>
        </div>

        {!batchMode ? (
          <form onSubmit={handleAddSingle} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label htmlFor="new-concept-name" className="block text-xs font-medium text-slate-600 mb-1">
                {t.conceptName}
              </label>
              <input
                id="new-concept-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.conceptNamePlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="new-concept-cat" className="block text-xs font-medium text-slate-600 mb-1">
                {t.category}
              </label>
              <input
                id="new-concept-cat"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t.categoryPlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="md:col-span-5">
              <label htmlFor="new-concept-def" className="block text-xs font-medium text-slate-600 mb-1">
                {t.definition}
              </label>
              <input
                id="new-concept-def"
                type="text"
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder={t.definitionPlaceholder}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addBtn}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={t.batchPlaceholder}
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{t.batchHint}</span>
              <button
                type="submit"
                disabled={!batchText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addConceptsBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll(map.concepts.length)}
          </button>
          <button
            type="button"
            onClick={() => setFilter('missing_def')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'missing_def'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterNeedsDef(missingDefsCount)}
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlinked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'unlinked'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterUnlinked}
          </button>
          {definitionIssues.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('flagged')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'flagged'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAiFlagged(definitionIssues.length)}
            </button>
          )}
        </div>
      </div>

      {/* Glossary List */}
      {map.concepts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <h3 className="font-display text-base font-semibold text-slate-900">
            {t.emptyTitle}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{t.emptyDesc}</p>
          <button
            type="button"
            onClick={onOpenAssistantReview}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.suggestStarterBtn}</span>
          </button>
        </div>
      ) : filteredConcepts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          {t.noFilterMatch}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {filteredConcepts.map((concept) => {
            const outgoing = map.links.filter((l) => l.sourceId === concept.id);
            const incoming = map.links.filter((l) => l.targetId === concept.id);
            const isSelected = selectedConceptId === concept.id;
            const aiIssue = issueByConceptName.get(concept.name.trim().toLowerCase());
            const hasDefinition = concept.definition.trim().length > 0;
            const otherConcepts = map.concepts.filter((c) => c.id !== concept.id);
            const draft = linkDrafts[concept.id] ?? {
              targetId: otherConcepts[0]?.id ?? '',
              label: '',
            };

            return (
              <div
                key={concept.id}
                ref={(el) => {
                  itemRefs.current[concept.id] = el;
                }}
                onClick={() => onSelectConcept(concept.id)}
                className={`p-6 transition-colors ${
                  isSelected ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50/40'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left/Start: Concept Title, Category & Definition */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <input
                            type="text"
                            aria-label={`Concept name for ${concept.name}`}
                            value={concept.name}
                            onChange={(e) =>
                              onUpdateConcept(concept.id, { name: e.target.value })
                            }
                            className="font-display text-base font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 min-w-[140px]"
                          />
                          <span className="text-xs text-slate-500 font-medium">
                            <span aria-hidden="true">· </span>
                            <input
                              type="text"
                              aria-label={`Category for ${concept.name}`}
                              value={concept.category}
                              onChange={(e) =>
                                onUpdateConcept(concept.id, { category: e.target.value })
                              }
                              className="bg-transparent w-24 text-xs text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none"
                            />
                          </span>
                        </div>

                        {/* Unboxed Metadata Line */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                          <span>{t.outgoing(outgoing.length)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{t.incoming(incoming.length)}</span>
                          {!hasDefinition && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-amber-700 font-sans font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {t.missingDefinition}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGoToMap(concept.id);
                          }}
                          title={t.showOnMap}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{t.showOnMap}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConcept(concept.id);
                          }}
                          title={t.deleteConcept}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        aria-label={`Definition for ${concept.name}`}
                        value={concept.definition}
                        onChange={(e) =>
                          onUpdateConcept(concept.id, { definition: e.target.value })
                        }
                        placeholder={t.editDefinitionPlaceholder}
                        className={`w-full px-3 py-2 text-sm leading-relaxed rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                          hasDefinition
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-amber-50/40 border-amber-300 text-slate-800 placeholder:text-amber-700/70'
                        }`}
                      />
                    </div>

                    {aiIssue && (
                      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>
                              {t.aiReviewPrefix(aiIssue.severity)} {aiIssue.issue}
                            </span>
                          </span>
                        </div>
                        {aiIssue.suggestedDefinition && (
                          <div className="flex items-start justify-between gap-3 pt-1">
                            <p className="text-xs text-slate-700 leading-relaxed">
                              <span className="font-semibold">{t.suggestedLabel} </span>
                              {aiIssue.suggestedDefinition}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateConcept(concept.id, {
                                  definition: aiIssue.suggestedDefinition,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>{t.applyBtn}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right/End: Related Concepts List & Quick Linker */}
                  <div className="lg:col-span-6 space-y-3 lg:border-s lg:border-slate-100 lg:ps-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        {t.relatedConcepts}
                      </span>
                    </div>

                    {outgoing.length === 0 && incoming.length === 0 ? (
                      <p className="text-xs text-slate-400">{t.noLinksYet}</p>
                    ) : (
                      <ul className="space-y-2">
                        {outgoing.map((link) => {
                          const target = byId.get(link.targetId);
                          if (!target) return null;
                          return (
                            <li
                              key={link.id}
                              className="flex items-center justify-between gap-2 text-sm py-1 border-b border-slate-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                <OutArrow className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                <input
                                  type="text"
                                  aria-label="Relationship label"
                                  value={link.label}
                                  onChange={(e) =>
                                    onUpdateLink(link.id, { label: e.target.value })
                                  }
                                  className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 w-36 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    jumpToConcept(target.id);
                                  }}
                                  className="text-sm font-medium text-blue-700 hover:underline truncate cursor-pointer"
                                >
                                  {target.name}
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteLink(link.id);
                                }}
                                title="Remove relationship"
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          );
                        })}

                        {incoming.map((link) => {
                          const source = byId.get(link.sourceId);
                          if (!source) return null;
                          return (
                            <li
                              key={link.id}
                              className="flex items-center justify-between gap-2 text-sm py-1 border-b border-slate-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                <InArrow className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    jumpToConcept(source.id);
                                  }}
                                  className="text-sm font-medium text-slate-800 hover:text-blue-700 hover:underline truncate cursor-pointer"
                                >
                                  {source.name}
                                </button>
                                <span className="text-xs text-slate-500">
                                  ({link.label || t.relatesToDefault} {t.thisConceptSuffix})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteLink(link.id);
                                }}
                                title="Remove relationship"
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {otherConcepts.length > 0 && (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={draft.label}
                          onChange={(e) =>
                            setLinkDrafts((prev) => ({
                              ...prev,
                              [concept.id]: { ...draft, label: e.target.value },
                            }))
                          }
                          placeholder={t.linkingPhrasePlaceholder}
                          className="sm:w-44 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <select
                          aria-label={`Target concept for ${concept.name}`}
                          value={draft.targetId || otherConcepts[0].id}
                          onChange={(e) =>
                            setLinkDrafts((prev) => ({
                              ...prev,
                              [concept.id]: { ...draft, targetId: e.target.value },
                            }))
                          }
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {otherConcepts.map((oc) => (
                            <option key={oc.id} value={oc.id}>
                              {oc.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetId = draft.targetId || otherConcepts[0].id;
                            const label = draft.label.trim() || t.relatesToDefault;
                            onAddLink(concept.id, targetId, label);
                            setLinkDrafts((prev) => ({
                              ...prev,
                              [concept.id]: { targetId, label: '' },
                            }));
                          }}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.linkBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
