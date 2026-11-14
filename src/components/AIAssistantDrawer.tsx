import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  MessageSquare,
  Plus,
  SearchCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { TRANSLATIONS, type Language } from '../i18n/translations';
import type {
  AIAskResponse,
  AIReviewResponse,
  AISuggestResponse,
  ConceptMapData,
  SuggestedNode,
} from '../types/conceptMap';

interface AIAssistantDrawerProps {
  language: Language;
  open: boolean;
  map: ConceptMapData;
  reviewResult: AIReviewResponse | null;
  onClose: () => void;
  onSetReviewResult: (review: AIReviewResponse | null) => void;
  onAddSuggestedNode: (node: SuggestedNode) => void;
  onApplySuggestedDefinition: (conceptName: string, definition: string) => void;
  onApplyRelationshipFix: (
    sourceName: string,
    targetName: string,
    suggestedLabel: string,
    currentLabel?: string
  ) => void;
  onSelectConceptByName: (name: string) => void;
}

type AssistantTab = 'suggest' | 'review' | 'ask';

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  language,
  open,
  map,
  reviewResult,
  onClose,
  onSetReviewResult,
  onAddSuggestedNode,
  onApplySuggestedDefinition,
  onApplyRelationshipFix,
  onSelectConceptByName,
}) => {
  const t = TRANSLATIONS[language].aiDrawer;
  const [tab, setTab] = useState<AssistantTab>('review');
  const [suggestGuidance, setSuggestGuidance] = useState('');
  const [suggestResult, setSuggestResult] = useState<AISuggestResponse | null>(null);
  const [askQuestion, setAskQuestion] = useState('');
  const [askResult, setAskResult] = useState<AIAskResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());

  if (!open) return null;

  const existingNames = new Set(map.concepts.map((c) => c.name.trim().toLowerCase()));

  const runSuggest = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: map.title,
          focusQuestion: map.focusQuestion,
          concepts: map.concepts,
          links: map.links,
          prompt: suggestGuidance,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get suggestions.');
      setSuggestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const runReview = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: map.title,
          focusQuestion: map.focusQuestion,
          concepts: map.concepts,
          links: map.links,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review map.');
      onSetReviewResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const runAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: map.title,
          focusQuestion: map.focusQuestion,
          concepts: map.concepts,
          links: map.links,
          question: askQuestion,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to answer question.');
      setAskResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = (node: SuggestedNode) => {
    onAddSuggestedNode(node);
    setAddedNames((prev) => new Set(prev).add(node.name.trim().toLowerCase()));
  };

  return (
    <aside
      aria-label={t.title}
      className="fixed top-[61px] end-0 bottom-0 w-full sm:w-[420px] bg-white border-s border-slate-200 shadow-xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <h2 className="font-display text-base font-bold text-slate-900">{t.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI assistant"
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="px-5 pt-3 pb-2 border-b border-slate-100 shrink-0">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('review')}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              tab === 'review'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>{t.reviewTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('suggest')}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              tab === 'suggest'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.suggestTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('ask')}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              tab === 'ask'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.askTab}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {error && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* REVIEW TAB */}
        {tab === 'review' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed">{t.reviewIntro}</p>
              <button
                type="button"
                onClick={runReview}
                disabled={loading || map.concepts.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.reviewRunning}</span>
                  </>
                ) : (
                  <>
                    <SearchCheck className="w-3.5 h-3.5" />
                    <span>{t.reviewBtn}</span>
                  </>
                )}
              </button>
            </div>

            {reviewResult && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {reviewResult.overallSummary}
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    {t.defFindings(reviewResult.definitionIssues.length)}
                  </h3>
                  {reviewResult.definitionIssues.length === 0 ? (
                    <p className="text-xs text-emerald-700">{t.defsLookGood}</p>
                  ) : (
                    reviewResult.definitionIssues.map((issue, i) => (
                      <div
                        key={`${issue.conceptName}-${i}`}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectConceptByName(issue.conceptName)}
                            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            {issue.conceptName}
                          </button>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              issue.severity === 'inaccurate'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>{issue.severity}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{issue.issue}</p>
                        {issue.suggestedDefinition && (
                          <div className="pt-1.5 border-t border-slate-100 space-y-2">
                            <p className="text-xs text-slate-800">
                              <span className="font-semibold">{t.suggestedPrefix} </span>
                              {issue.suggestedDefinition}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                onApplySuggestedDefinition(
                                  issue.conceptName,
                                  issue.suggestedDefinition
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>{t.applyDef}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    {t.relFindings(reviewResult.relationshipIssues.length)}
                  </h3>
                  {reviewResult.relationshipIssues.length === 0 ? (
                    <p className="text-xs text-emerald-700">{t.relsLookGood}</p>
                  ) : (
                    reviewResult.relationshipIssues.map((rel, i) => (
                      <div
                        key={`${rel.sourceName}-${rel.targetName}-${i}`}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {rel.sourceName} → {rel.targetName}
                          </span>
                          <span className="text-[11px] font-medium text-amber-700">
                            {rel.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{rel.issue}</p>
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                          <span className="text-xs text-slate-700">
                            {t.labelPrefix}{' '}
                            <span className="font-semibold">{rel.suggestedLabel}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onApplyRelationshipFix(
                                rel.sourceName,
                                rel.targetName,
                                rel.suggestedLabel,
                                rel.currentLabel
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 whitespace-nowrap cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>
                              {rel.type === 'missing_link' ? t.addLinkBtn : t.updateLinkBtn}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    {t.missingKeyConcepts(reviewResult.missingKeyConcepts.length)}
                  </h3>
                  {reviewResult.missingKeyConcepts.map((kc, i) => {
                    const alreadyExists =
                      existingNames.has(kc.name.trim().toLowerCase()) ||
                      addedNames.has(kc.name.trim().toLowerCase());
                    return (
                      <div
                        key={`${kc.name}-${i}`}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{kc.name}</span>
                          <button
                            type="button"
                            disabled={alreadyExists}
                            onClick={() =>
                              handleAddNode({
                                name: kc.name,
                                definition: kc.definition,
                                category: 'Key Concept',
                                rationale: kc.whyEssential,
                                suggestedRelationships: kc.suggestedConnections || [],
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md disabled:bg-emerald-700 disabled:opacity-90 cursor-pointer shrink-0"
                          >
                            {alreadyExists ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{t.addedBtn}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>{t.addKeyConceptBtn}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700">{kc.definition}</p>
                        <p className="text-xs text-slate-500">{kc.whyEssential}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUGGEST TAB */}
        {tab === 'suggest' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label
                htmlFor="suggest-guidance"
                className="block text-xs font-semibold text-slate-700"
              >
                {t.suggestGuidanceLabel}
              </label>
              <input
                id="suggest-guidance"
                type="text"
                value={suggestGuidance}
                onChange={(e) => setSuggestGuidance(e.target.value)}
                placeholder={t.suggestGuidancePlaceholder}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={runSuggest}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.suggestRunning}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.suggestBtn}</span>
                  </>
                )}
              </button>
            </div>

            {suggestResult && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {suggestResult.summary}
                </p>

                {suggestResult.suggestions.map((node, i) => {
                  const alreadyExists =
                    existingNames.has(node.name.trim().toLowerCase()) ||
                    addedNames.has(node.name.trim().toLowerCase());
                  return (
                    <div
                      key={`${node.name}-${i}`}
                      className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{node.name}</div>
                          <div className="text-[11px] text-slate-500">{node.category}</div>
                        </div>
                        <button
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => handleAddNode(node)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md disabled:bg-emerald-700 cursor-pointer shrink-0"
                        >
                          {alreadyExists ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{t.addedBtn}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>{t.addToMapBtn}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {node.definition}
                      </p>
                      <p className="text-[11px] text-slate-500">{node.rationale}</p>
                      {node.suggestedRelationships?.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          {node.suggestedRelationships.map((sr, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-[11px] text-slate-600"
                            >
                              <ArrowRight className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>
                                {sr.direction === 'incoming'
                                  ? `${sr.targetConceptName} — ${sr.label} → ${node.name}`
                                  : `${node.name} — ${sr.label} → ${sr.targetConceptName}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ASK TAB */}
        {tab === 'ask' && (
          <div className="space-y-4">
            <form onSubmit={runAsk} className="space-y-2.5">
              <label
                htmlFor="ask-assistant-input"
                className="block text-xs font-semibold text-slate-700"
              >
                {t.askLabel}
              </label>
              <textarea
                id="ask-assistant-input"
                rows={3}
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                placeholder={t.askPlaceholder}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={loading || !askQuestion.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.askRunning}</span>
                  </>
                ) : (
                  <span>{t.askBtn}</span>
                )}
              </button>
            </form>

            {askResult && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {askResult.answer}
                </div>

                {askResult.proposedNodes.map((node, i) => {
                  const alreadyExists =
                    existingNames.has(node.name.trim().toLowerCase()) ||
                    addedNames.has(node.name.trim().toLowerCase());
                  return (
                    <div
                      key={`${node.name}-${i}`}
                      className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{node.name}</span>
                        <button
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => handleAddNode(node)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md disabled:bg-emerald-700 cursor-pointer"
                        >
                          {alreadyExists ? t.addedBtn : t.addShortBtn}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600">{node.definition}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
