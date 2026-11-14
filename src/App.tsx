import { useEffect, useState } from 'react';
import { getStarterMaps } from './data/starterMaps';
import {
  LANGUAGE_META,
  TRANSLATIONS,
  type HelpSection,
  type Language,
} from './i18n/translations';
import type {
  AIReviewResponse,
  ActiveView,
  ConceptLink,
  ConceptMapData,
  ConceptNode,
  SuggestedNode,
  WorkflowStage,
} from './types/conceptMap';
import { autoArrangeLayout, placeConceptNearRelated } from './utils/layout';
import { TopBar } from './components/TopBar';
import { WorkflowBanner } from './components/WorkflowBanner';
import { GlossaryView } from './components/GlossaryView';
import { MapCanvasView } from './components/MapCanvasView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { ImportExportModal } from './components/ImportExportModal';
import { GuideModal } from './components/GuideModal';

const STORAGE_KEY = 'conceptatlas_active_map_v1';
const LANGUAGE_KEY = 'conceptatlas_language_v1';
const STARTER_TIMESTAMP = '2026-11-14T00:00:00.000Z';

function loadInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'he' || saved === 'ar' || saved === 'en') {
      return saved;
    }
  } catch {
    // Default to Hebrew
  }
  return 'he';
}

function loadInitialMap(initialLang: Language): ConceptMapData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConceptMapData;
      if (parsed && Array.isArray(parsed.concepts) && Array.isArray(parsed.links)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to starter map in active language
  }
  return structuredClone(getStarterMaps(initialLang)[0]);
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function App() {
  const [language, setLanguage] = useState<Language>(loadInitialLanguage);
  const [map, setMap] = useState<ConceptMapData>(() => loadInitialMap(loadInitialLanguage()));
  const [activeView, setActiveView] = useState<ActiveView>('glossary');
  const [stage, setStage] = useState<WorkflowStage>('define');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIReviewResponse | null>(null);

  const [ioModalOpen, setIoModalOpen] = useState(false);
  const [ioModalTab, setIoModalTab] = useState<'export' | 'import'>('export');
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<HelpSection>('about');

  useEffect(() => {
    const meta = LANGUAGE_META[language];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // Ignore storage errors
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Ignore quota errors
    }
  }, [map]);

  const handleChangeLanguage = (nextLang: Language) => {
    setLanguage(nextLang);
    // If the user is still looking at an untouched starter map, translate it too
    if (map.updatedAt === STARTER_TIMESTAMP) {
      const localizedStarter = getStarterMaps(nextLang).find((s) => s.id === map.id);
      if (localizedStarter) {
        setMap(structuredClone(localizedStarter));
      }
    }
  };

  const updateMap = (updater: (prev: ConceptMapData) => ConceptMapData) => {
    setMap((prev) => ({
      ...updater(prev),
      updatedAt: new Date().toISOString(),
    }));
  };

  const defaultCategory = TRANSLATIONS[language].glossary.categoryPlaceholder;
  const defaultRelLabel = TRANSLATIONS[language].glossary.relatesToDefault;

  const handleAddConcept = (
    name: string,
    definition: string,
    category: string,
    coords?: { x: number; y: number }
  ): string => {
    const id = makeId('c');
    updateMap((prev) => {
      const pos = coords ?? placeConceptNearRelated(prev.concepts, []);
      const nextNode: ConceptNode = {
        id,
        name,
        definition,
        category: category || defaultCategory,
        x: pos.x,
        y: pos.y,
        placed: true,
      };
      return {
        ...prev,
        concepts: [...prev.concepts, nextNode],
      };
    });
    return id;
  };

  const handleBatchAddConcepts = (names: string[]) => {
    updateMap((prev) => {
      const existingLower = new Set(prev.concepts.map((c) => c.name.trim().toLowerCase()));
      const additions: ConceptNode[] = [];
      const workingList = [...prev.concepts];

      for (const rawName of names) {
        const clean = rawName.trim();
        if (!clean || existingLower.has(clean.toLowerCase())) continue;
        existingLower.add(clean.toLowerCase());
        const pos = placeConceptNearRelated(workingList, []);
        const node: ConceptNode = {
          id: makeId('c'),
          name: clean,
          definition: '',
          category: defaultCategory,
          x: pos.x,
          y: pos.y,
          placed: true,
        };
        additions.push(node);
        workingList.push(node);
      }

      return {
        ...prev,
        concepts: [...prev.concepts, ...additions],
      };
    });
  };

  const handleUpdateConcept = (id: string, patch: Partial<ConceptNode>) => {
    updateMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const handleDeleteConcept = (id: string) => {
    updateMap((prev) => ({
      ...prev,
      concepts: prev.concepts.filter((c) => c.id !== id),
      links: prev.links.filter((l) => l.sourceId !== id && l.targetId !== id),
    }));
    if (selectedConceptId === id) {
      setSelectedConceptId(null);
    }
  };

  const handleAddLink = (sourceId: string, targetId: string, label: string) => {
    if (sourceId === targetId) return;
    updateMap((prev) => {
      const duplicate = prev.links.some(
        (l) =>
          l.sourceId === sourceId &&
          l.targetId === targetId &&
          l.label.trim().toLowerCase() === label.trim().toLowerCase()
      );
      if (duplicate) return prev;
      const newLink: ConceptLink = {
        id: makeId('l'),
        sourceId,
        targetId,
        label: label.trim() || defaultRelLabel,
      };
      return {
        ...prev,
        links: [...prev.links, newLink],
      };
    });
  };

  const handleUpdateLink = (linkId: string, patch: Partial<ConceptLink>) => {
    updateMap((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
    }));
  };

  const handleDeleteLink = (linkId: string) => {
    updateMap((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== linkId),
    }));
  };

  const handleAutoArrange = () => {
    updateMap((prev) => ({
      ...prev,
      concepts: autoArrangeLayout(prev.concepts, prev.links),
    }));
  };

  const handlePlaceAll = () => {
    updateMap((prev) => {
      const working = [...prev.concepts];
      for (let i = 0; i < working.length; i++) {
        if (!working[i].placed) {
          const pos = placeConceptNearRelated(working, []);
          working[i] = { ...working[i], x: pos.x, y: pos.y, placed: true };
        }
      }
      return { ...prev, concepts: working };
    });
  };

  const handleLoadStarter = (starterId: string) => {
    const found = getStarterMaps(language).find((s) => s.id === starterId);
    if (!found) return;
    setMap(structuredClone(found));
    setSelectedConceptId(null);
    setReviewResult(null);
    if (found.concepts.length === 0) {
      setStage('define');
      setActiveView('glossary');
    }
  };

  const handleImportMap = (imported: ConceptMapData) => {
    setMap(imported);
    setSelectedConceptId(null);
    setReviewResult(null);
    setActiveView('map');
    setStage('map');
  };

  const handleAddSuggestedNode = (suggestion: SuggestedNode) => {
    updateMap((prev) => {
      const existing = prev.concepts.find(
        (c) => c.name.trim().toLowerCase() === suggestion.name.trim().toLowerCase()
      );
      if (existing) return prev;

      const byLowerName = new Map(
        prev.concepts.map((c) => [c.name.trim().toLowerCase(), c])
      );
      const relatedIds: string[] = [];
      for (const sr of suggestion.suggestedRelationships || []) {
        const match = byLowerName.get((sr.targetConceptName || '').trim().toLowerCase());
        if (match) relatedIds.push(match.id);
      }

      const pos = placeConceptNearRelated(prev.concepts, relatedIds);
      const newId = makeId('c');
      const newNode: ConceptNode = {
        id: newId,
        name: suggestion.name.trim(),
        definition: suggestion.definition.trim(),
        category: suggestion.category?.trim() || defaultCategory,
        x: pos.x,
        y: pos.y,
        placed: true,
      };

      const newLinks: ConceptLink[] = [];
      for (const sr of suggestion.suggestedRelationships || []) {
        const target = byLowerName.get((sr.targetConceptName || '').trim().toLowerCase());
        if (!target) continue;
        const isIncoming = sr.direction === 'incoming';
        newLinks.push({
          id: makeId('l'),
          sourceId: isIncoming ? target.id : newId,
          targetId: isIncoming ? newId : target.id,
          label: (sr.label || defaultRelLabel).trim(),
        });
      }

      return {
        ...prev,
        concepts: [...prev.concepts, newNode],
        links: [...prev.links, ...newLinks],
      };
    });
  };

  const handleApplySuggestedDefinition = (conceptName: string, definition: string) => {
    const targetLower = conceptName.trim().toLowerCase();
    updateMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) =>
        c.name.trim().toLowerCase() === targetLower ? { ...c, definition } : c
      ),
    }));
  };

  const handleApplyRelationshipFix = (
    sourceName: string,
    targetName: string,
    suggestedLabel: string,
    currentLabel?: string
  ) => {
    updateMap((prev) => {
      const src = prev.concepts.find(
        (c) => c.name.trim().toLowerCase() === sourceName.trim().toLowerCase()
      );
      const tgt = prev.concepts.find(
        (c) => c.name.trim().toLowerCase() === targetName.trim().toLowerCase()
      );
      if (!src || !tgt) return prev;

      const existingIdx = prev.links.findIndex(
        (l) =>
          l.sourceId === src.id &&
          l.targetId === tgt.id &&
          (!currentLabel ||
            l.label.trim().toLowerCase() === currentLabel.trim().toLowerCase())
      );

      if (existingIdx >= 0) {
        const nextLinks = [...prev.links];
        nextLinks[existingIdx] = {
          ...nextLinks[existingIdx],
          label: suggestedLabel.trim() || nextLinks[existingIdx].label,
        };
        return { ...prev, links: nextLinks };
      }

      return {
        ...prev,
        links: [
          ...prev.links,
          {
            id: makeId('l'),
            sourceId: src.id,
            targetId: tgt.id,
            label: suggestedLabel.trim() || defaultRelLabel,
          },
        ],
      };
    });
  };

  const handleSelectConceptByName = (name: string) => {
    const found = map.concepts.find(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (found) {
      setSelectedConceptId(found.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        language={language}
        activeView={activeView}
        assistantOpen={assistantOpen}
        onSelectView={(v) => {
          setActiveView(v);
          setStage(v === 'map' ? 'map' : stage === 'map' ? 'relate' : stage);
        }}
        onToggleAssistant={() => setAssistantOpen((v) => !v)}
        onOpenHelp={(section) => {
          setHelpSection(section);
          setHelpOpen(true);
        }}
        onOpenExport={() => {
          setIoModalTab('export');
          setIoModalOpen(true);
        }}
      />

      <WorkflowBanner
        language={language}
        map={map}
        activeView={activeView}
        stage={stage}
        onChangeLanguage={handleChangeLanguage}
        onChangeStage={setStage}
        onChangeView={setActiveView}
        onUpdateTitle={(title) => updateMap((prev) => ({ ...prev, title }))}
        onUpdateFocusQuestion={(focusQuestion) =>
          updateMap((prev) => ({ ...prev, focusQuestion }))
        }
        onLoadStarter={handleLoadStarter}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'glossary' ? (
          <GlossaryView
            language={language}
            map={map}
            stage={stage}
            selectedConceptId={selectedConceptId}
            definitionIssues={reviewResult?.definitionIssues ?? []}
            onSelectConcept={setSelectedConceptId}
            onAddConcept={handleAddConcept}
            onBatchAddConcepts={handleBatchAddConcepts}
            onUpdateConcept={handleUpdateConcept}
            onDeleteConcept={handleDeleteConcept}
            onAddLink={handleAddLink}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            onGoToMap={(focusId) => {
              if (focusId) setSelectedConceptId(focusId);
              setStage('map');
              setActiveView('map');
            }}
            onAdvanceStage={(nextStage) => setStage(nextStage)}
            onOpenAssistantReview={() => setAssistantOpen(true)}
          />
        ) : (
          <MapCanvasView
            language={language}
            map={map}
            selectedConceptId={selectedConceptId}
            definitionIssues={reviewResult?.definitionIssues ?? []}
            onSelectConcept={setSelectedConceptId}
            onAddConcept={handleAddConcept}
            onUpdateConcept={handleUpdateConcept}
            onDeleteConcept={handleDeleteConcept}
            onAddLink={handleAddLink}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            onAutoArrange={handleAutoArrange}
            onPlaceAll={handlePlaceAll}
          />
        )}
      </main>

      <AIAssistantDrawer
        language={language}
        open={assistantOpen}
        map={map}
        reviewResult={reviewResult}
        onClose={() => setAssistantOpen(false)}
        onSetReviewResult={setReviewResult}
        onAddSuggestedNode={handleAddSuggestedNode}
        onApplySuggestedDefinition={handleApplySuggestedDefinition}
        onApplyRelationshipFix={handleApplyRelationshipFix}
        onSelectConceptByName={handleSelectConceptByName}
      />

      <ImportExportModal
        language={language}
        open={ioModalOpen}
        initialTab={ioModalTab}
        map={map}
        onClose={() => setIoModalOpen(false)}
        onImportMap={handleImportMap}
      />

      <GuideModal
        open={helpOpen}
        section={helpSection}
        language={language}
        onChangeSection={setHelpSection}
        onClose={() => setHelpOpen(false)}
        onJumpToStage={(nextStage, nextView) => {
          setStage(nextStage);
          setActiveView(nextView);
        }}
      />
    </div>
  );
}
