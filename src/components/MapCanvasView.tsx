import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Eye,
  EyeOff,
  GitBranch,
  LayoutGrid,
  Link2,
  Maximize2,
  MousePointer,
  Plus,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { LANGUAGE_META, TRANSLATIONS, type Language } from '../i18n/translations';
import type {
  ConceptLink,
  ConceptMapData,
  ConceptNode,
  DefinitionIssue,
} from '../types/conceptMap';
import { NODE_HEIGHT, NODE_WIDTH } from '../utils/layout';

interface MapCanvasViewProps {
  language: Language;
  map: ConceptMapData;
  selectedConceptId: string | null;
  definitionIssues: DefinitionIssue[];
  onSelectConcept: (id: string | null) => void;
  onAddConcept: (
    name: string,
    definition: string,
    category: string,
    coords?: { x: number; y: number }
  ) => string;
  onUpdateConcept: (id: string, patch: Partial<ConceptNode>) => void;
  onDeleteConcept: (id: string) => void;
  onAddLink: (sourceId: string, targetId: string, label: string) => void;
  onUpdateLink: (linkId: string, patch: Partial<ConceptLink>) => void;
  onDeleteLink: (linkId: string) => void;
  onAutoArrange: () => void;
  onPlaceAll: () => void;
}

export const MapCanvasView: React.FC<MapCanvasViewProps> = ({
  language,
  map,
  selectedConceptId,
  definitionIssues,
  onSelectConcept,
  onAddConcept,
  onUpdateConcept,
  onDeleteConcept,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onAutoArrange,
  onPlaceAll,
}) => {
  const t = TRANSLATIONS[language].mapCanvas;
  const defaultRelLabel = TRANSLATIONS[language].glossary.relatesToDefault;
  const isRtl = LANGUAGE_META[language].dir === 'rtl';

  const containerRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [zoom, setZoom] = useState(1);
  const [toolMode, setToolMode] = useState<'select' | 'link'>('select');
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const [addingNodeAt, setAddingNodeAt] = useState<{ x: number; y: number } | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDef, setNewNodeDef] = useState('');

  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  const [pendingLinkPair, setPendingLinkPair] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);
  const [pendingLinkLabel, setPendingLinkLabel] = useState('');

  const [dragState, setDragState] = useState<
    | { type: 'pan'; startX: number; startY: number; origPanX: number; origPanY: number }
    | { type: 'node'; nodeId: string; startX: number; startY: number; origX: number; origY: number }
    | { type: 'connect'; sourceId: string; pointerWorldX: number; pointerWorldY: number }
    | null
  >(null);

  const [inspectorTargetId, setInspectorTargetId] = useState('');
  const [inspectorLinkLabel, setInspectorLinkLabel] = useState('');

  const placedConcepts = useMemo(
    () => map.concepts.filter((c) => c.placed),
    [map.concepts]
  );
  const unplacedConcepts = useMemo(
    () => map.concepts.filter((c) => !c.placed),
    [map.concepts]
  );

  const issueByConceptName = useMemo(() => {
    const record = new Map<string, DefinitionIssue>();
    for (const issue of definitionIssues) {
      record.set(issue.conceptName.trim().toLowerCase(), issue);
    }
    return record;
  }, [definitionIssues]);

  const placedById = useMemo(
    () => new Map(placedConcepts.map((c) => [c.id, c])),
    [placedConcepts]
  );

  const selectedConcept = useMemo(
    () => map.concepts.find((c) => c.id === selectedConceptId) ?? null,
    [map.concepts, selectedConceptId]
  );

  const selectedLink = useMemo(
    () => map.links.find((l) => l.id === selectedLinkId) ?? null,
    [map.links, selectedLinkId]
  );

  const fitView = () => {
    const el = containerRef.current;
    if (!el || placedConcepts.length === 0) {
      setPan({ x: 40, y: 30 });
      setZoom(1);
      return;
    }
    const minX = Math.min(...placedConcepts.map((c) => c.x));
    const minY = Math.min(...placedConcepts.map((c) => c.y));
    const maxX = Math.max(...placedConcepts.map((c) => c.x + NODE_WIDTH));
    const maxY = Math.max(...placedConcepts.map((c) => c.y + NODE_HEIGHT));

    const worldW = Math.max(200, maxX - minX);
    const worldH = Math.max(150, maxY - minY);

    const viewW = el.clientWidth - (selectedConcept || selectedLink ? 340 : 40);
    const viewH = el.clientHeight - 40;
    const nextZoom = Math.max(
      0.45,
      Math.min(1.25, Math.min(viewW / (worldW + 120), viewH / (worldH + 120)))
    );

    setZoom(Number(nextZoom.toFixed(2)));
    setPan({
      x: Math.round((viewW - worldW * nextZoom) / 2 - minX * nextZoom + 20),
      y: Math.round((viewH - worldH * nextZoom) / 2 - minY * nextZoom + 20),
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      if (dragState.type === 'pan') {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        setPan({ x: dragState.origPanX + dx, y: dragState.origPanY + dy });
      } else if (dragState.type === 'node') {
        const dx = (e.clientX - dragState.startX) / zoom;
        const dy = (e.clientY - dragState.startY) / zoom;
        onUpdateConcept(dragState.nodeId, {
          x: Math.round(dragState.origX + dx),
          y: Math.round(dragState.origY + dy),
        });
      } else if (dragState.type === 'connect') {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const wx = (e.clientX - rect.left - pan.x) / zoom;
        const wy = (e.clientY - rect.top - pan.y) / zoom;
        setDragState({ ...dragState, pointerWorldX: wx, pointerWorldY: wy });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragState?.type === 'connect') {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const wx = (e.clientX - rect.left - pan.x) / zoom;
          const wy = (e.clientY - rect.top - pan.y) / zoom;
          const hit = placedConcepts.find(
            (c) =>
              c.id !== dragState.sourceId &&
              wx >= c.x &&
              wx <= c.x + NODE_WIDTH &&
              wy >= c.y &&
              wy <= c.y + NODE_HEIGHT
          );
          if (hit) {
            setPendingLinkPair({ sourceId: dragState.sourceId, targetId: hit.id });
            setPendingLinkLabel('');
          }
        }
      }
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, zoom, pan, placedConcepts, onUpdateConcept]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.canvasBg) {
      return;
    }
    if (toolMode === 'link' && linkSourceId) {
      setLinkSourceId(null);
      return;
    }
    onSelectConcept(null);
    setSelectedLinkId(null);
    setDragState({
      type: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      origPanX: pan.x,
      origPanY: pan.y,
    });
  };

  const handleNodeClick = (node: ConceptNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (toolMode === 'link') {
      if (!linkSourceId) {
        setLinkSourceId(node.id);
      } else if (linkSourceId !== node.id) {
        setPendingLinkPair({ sourceId: linkSourceId, targetId: node.id });
        setPendingLinkLabel('');
        setLinkSourceId(null);
      } else {
        setLinkSourceId(null);
      }
      return;
    }
    setSelectedLinkId(null);
    onSelectConcept(node.id);
  };

  const handleCreatePendingLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLinkPair) return;
    onAddLink(
      pendingLinkPair.sourceId,
      pendingLinkPair.targetId,
      pendingLinkLabel.trim() || defaultRelLabel
    );
    setPendingLinkPair(null);
    setPendingLinkLabel('');
  };

  const handleCreateNodeOnCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingNodeAt || !newNodeName.trim()) return;
    const id = onAddConcept(
      newNodeName.trim(),
      newNodeDef.trim(),
      TRANSLATIONS[language].glossary.categoryPlaceholder,
      addingNodeAt
    );
    setAddingNodeAt(null);
    setNewNodeName('');
    setNewNodeDef('');
    onSelectConcept(id);
  };

  const getEdgeEndpoints = (src: ConceptNode, tgt: ConceptNode) => {
    const sx = src.x + NODE_WIDTH / 2;
    const sy = src.y + NODE_HEIGHT / 2;
    const tx = tgt.x + NODE_WIDTH / 2;
    const ty = tgt.y + NODE_HEIGHT / 2;
    const dx = tx - sx;
    const dy = ty - sy;
    if (dx === 0 && dy === 0) return { sx, sy, tx, ty };

    const halfW = NODE_WIDTH / 2 + 6;
    const halfH = NODE_HEIGHT / 2 + 6;
    const scaleX = Math.abs(dx) > 0 ? halfW / Math.abs(dx) : Infinity;
    const scaleY = Math.abs(dy) > 0 ? halfH / Math.abs(dy) : Infinity;
    const tEnd = Math.min(scaleX, scaleY, 0.9);

    return {
      sx: sx + dx * tEnd,
      sy: sy + dy * tEnd,
      tx: tx - dx * tEnd,
      ty: ty - dy * tEnd,
    };
  };

  const inspectorOtherConcepts = selectedConcept
    ? map.concepts.filter((c) => c.id !== selectedConcept.id)
    : [];

  return (
    <div className="relative flex flex-col h-[calc(100vh-188px)] min-h-[540px] bg-slate-50">
      {/* Canvas Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap shrink-0 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setToolMode('select');
                setLinkSourceId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                toolMode === 'select'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>{t.moveEdit}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setToolMode('link');
                setSelectedLinkId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                toolMode === 'link'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{t.drawLink}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setAddingNodeAt({
                x: Math.round((280 - pan.x) / zoom),
                y: Math.round((160 - pan.y) / zoom),
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newConcept}</span>
          </button>

          <button
            type="button"
            onClick={onAutoArrange}
            disabled={map.concepts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.autoArrange}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDefinitions((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            {showDefinitions ? (
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{showDefinitions ? t.hideDefs : t.showDefs}</span>
          </button>
        </div>

        {toolMode === 'link' && (
          <div className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            {linkSourceId
              ? t.linkPromptClickTarget(placedById.get(linkSourceId)?.name ?? '')
              : t.linkPromptClickSource}
          </div>
        )}

        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            aria-label="Zoom out"
            className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono tabular-nums text-slate-600 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
            aria-label="Zoom in"
            className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={fitView}
            title={t.fit}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{t.fit}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Inspector Split */}
      <div className="relative flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          dir="ltr"
          data-canvas-bg="true"
          onPointerDown={handleCanvasPointerDown}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.08 : 0.08;
              setZoom((z) => Math.max(0.4, Math.min(1.8, Number((z + delta).toFixed(2)))));
            }
          }}
          className="relative flex-1 overflow-hidden canvas-dot-grid select-none cursor-grab active:cursor-grabbing"
        >
          {placedConcepts.length === 0 && unplacedConcepts.length === 0 && (
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md pointer-events-auto shadow-sm space-y-3">
                <h3 className="font-display text-base font-bold text-slate-900">
                  {t.emptyTitle}
                </h3>
                <p className="text-sm text-slate-600">{t.emptyDesc}</p>
                <button
                  type="button"
                  onClick={() => setAddingNodeAt({ x: 320, y: 180 })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addFirstConcept}</span>
                </button>
              </div>
            </div>
          )}

          {/* World Transform Container */}
          <div
            data-canvas-bg="true"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* SVG Edges Layer */}
            <svg
              className="overflow-visible absolute top-0 left-0 w-1 h-1 pointer-events-none"
              aria-hidden="false"
            >
              <defs>
                <marker
                  id="arrowhead-default"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
                <marker
                  id="arrowhead-selected"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 10 4, 0 8" fill="#1d4ed8" />
                </marker>
              </defs>

              {map.links.map((link) => {
                const src = placedById.get(link.sourceId);
                const tgt = placedById.get(link.targetId);
                if (!src || !tgt) return null;

                const hasReverse = map.links.some(
                  (other) =>
                    other.id !== link.id &&
                    other.sourceId === link.targetId &&
                    other.targetId === link.sourceId
                );

                const { sx, sy, tx, ty } = getEdgeEndpoints(src, tgt);
                const mx = (sx + tx) / 2;
                const my = (sy + ty) / 2;
                const dx = tx - sx;
                const dy = ty - sy;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offset = hasReverse ? 28 : 0;
                const cx = mx - (dy / len) * offset;
                const cy = my + (dx / len) * offset;

                const pathD = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
                const labelX = 0.25 * sx + 0.5 * cx + 0.25 * tx;
                const labelY = 0.25 * sy + 0.5 * cy + 0.25 * ty;

                const isSelected = selectedLinkId === link.id;
                const isConnectedToSelectedNode =
                  selectedConceptId === link.sourceId ||
                  selectedConceptId === link.targetId;

                const labelBoxW = Math.max(48, link.label.length * 7.2 + 18);

                return (
                  <g
                    key={link.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConcept(null);
                      setSelectedLinkId(link.id);
                    }}
                  >
                    <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        isSelected
                          ? '#1d4ed8'
                          : isConnectedToSelectedNode
                          ? '#3b82f6'
                          : '#94a3b8'
                      }
                      strokeWidth={isSelected || isConnectedToSelectedNode ? 2.4 : 1.8}
                      markerEnd={
                        isSelected || isConnectedToSelectedNode
                          ? 'url(#arrowhead-selected)'
                          : 'url(#arrowhead-default)'
                      }
                    />
                    {link.label && (
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect
                          x={-labelBoxW / 2}
                          y={-12}
                          width={labelBoxW}
                          height={24}
                          rx={6}
                          fill={isSelected ? '#eff6ff' : '#ffffff'}
                          stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                          strokeWidth={1}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={11.5}
                          fontWeight={500}
                          fill={isSelected ? '#1d4ed8' : '#334155'}
                          fontFamily="Plus Jakarta Sans, Heebo, Noto Sans Arabic, sans-serif"
                        >
                          {link.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {dragState?.type === 'connect' && (() => {
                const src = placedById.get(dragState.sourceId);
                if (!src) return null;
                return (
                  <line
                    x1={src.x + NODE_WIDTH / 2}
                    y1={src.y + NODE_HEIGHT / 2}
                    x2={dragState.pointerWorldX}
                    y2={dragState.pointerWorldY}
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                  />
                );
              })()}
            </svg>

            {/* HTML Concept Nodes Layer */}
            {placedConcepts.map((node) => {
              const isSelected = selectedConceptId === node.id;
              const isLinkSource = linkSourceId === node.id;
              const aiIssue = issueByConceptName.get(node.name.trim().toLowerCase());
              const linkCount = map.links.filter(
                (l) => l.sourceId === node.id || l.targetId === node.id
              ).length;

              return (
                <div
                  key={node.id}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: NODE_WIDTH,
                    minHeight: NODE_HEIGHT,
                  }}
                  onPointerDown={(e) => {
                    if (toolMode === 'link') return;
                    e.stopPropagation();
                    setSelectedLinkId(null);
                    onSelectConcept(node.id);
                    setDragState({
                      type: 'node',
                      nodeId: node.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      origX: node.x,
                      origY: node.y,
                    });
                  }}
                  onClick={(e) => handleNodeClick(node, e)}
                  className={`group absolute top-0 left-0 pointer-events-auto bg-white rounded-xl border p-3.5 transition-shadow cursor-pointer ${
                    isSelected || isLinkSource
                      ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md z-10'
                      : aiIssue
                      ? 'border-amber-400 shadow-sm hover:border-amber-500'
                      : 'border-slate-200 shadow-sm hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
                    <span className="truncate">{node.category || 'Concept'}</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {t.linksSuffix(linkCount)}
                    </span>
                  </div>

                  <div className="mt-1 font-display text-sm font-bold text-slate-900 leading-snug">
                    {node.name}
                  </div>

                  {showDefinitions && (
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {node.definition.trim() ? (
                        node.definition
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {t.missingDef}
                        </span>
                      )}
                    </p>
                  )}

                  {aiIssue && (
                    <div className="mt-2 pt-1.5 border-t border-amber-100 flex items-center gap-1 text-[11px] font-medium text-amber-800">
                      <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                      <span className="truncate">{t.aiDefFlag(aiIssue.severity)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    title={t.dragToConnectTitle}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setDragState({
                        type: 'connect',
                        sourceId: node.id,
                        pointerWorldX: (e.clientX - rect.left - pan.x) / zoom,
                        pointerWorldY: (e.clientY - rect.top - pan.y) / zoom,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center shadow cursor-crosshair"
                  >
                    <GitBranch className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Unplaced Concepts Tray */}
          {unplacedConcepts.length > 0 && (
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="absolute bottom-4 start-4 z-20 bg-white border border-slate-200 rounded-xl shadow-md p-3.5 max-w-sm"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  {t.unplacedTitle(unplacedConcepts.length)}
                </span>
                <button
                  type="button"
                  onClick={onPlaceAll}
                  className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                >
                  {t.placeAll}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unplacedConcepts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      onUpdateConcept(c.id, {
                        placed: true,
                        x: Math.round((240 - pan.x) / zoom),
                        y: Math.round((160 - pan.y) / zoom),
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Concept Popover on Canvas */}
          {addingNodeAt && (
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="absolute top-4 start-4 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-80"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">{t.newNodeModalTitle}</h3>
                <button
                  type="button"
                  onClick={() => setAddingNodeAt(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateNodeOnCanvas} className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder={t.nodeNamePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <textarea
                  rows={2}
                  value={newNodeDef}
                  onChange={(e) => setNewNodeDef(e.target.value)}
                  placeholder={t.nodeDefPlaceholder}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddingNodeAt(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={!newNodeName.trim()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {t.createNode}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pending Link Label Dialog */}
          {pendingLinkPair && (
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="absolute inset-0 z-30 bg-slate-900/20 flex items-center justify-center p-4"
            >
              <form
                onSubmit={handleCreatePendingLink}
                className="bg-white border border-slate-200 rounded-xl shadow-xl p-5 w-full max-w-sm space-y-4"
              >
                <h3 className="text-sm font-semibold text-slate-900">{t.nameRelTitle}</h3>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {placedById.get(pendingLinkPair.sourceId)?.name}
                  </span>{' '}
                  →{' '}
                  <span className="font-semibold text-slate-900">
                    {placedById.get(pendingLinkPair.targetId)?.name}
                  </span>
                </p>
                <input
                  type="text"
                  autoFocus
                  value={pendingLinkLabel}
                  onChange={(e) => setPendingLinkLabel(e.target.value)}
                  placeholder={t.relPhrasePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingLinkPair(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                  >
                    {t.addLink}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Inspector Sidebar */}
        {(selectedConcept || selectedLink) && (
          <aside className="w-80 lg:w-96 bg-white border-s border-slate-200 p-5 overflow-y-auto shrink-0 z-20 space-y-5">
            {selectedConcept && (
              <>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    {t.conceptInspector}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectConcept(null)}
                    aria-label="Close inspector"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      value={selectedConcept.name}
                      onChange={(e) =>
                        onUpdateConcept(selectedConcept.id, { name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.categoryLabel}
                    </label>
                    <input
                      type="text"
                      value={selectedConcept.category}
                      onChange={(e) =>
                        onUpdateConcept(selectedConcept.id, { category: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.defLabel}
                    </label>
                    <textarea
                      rows={4}
                      value={selectedConcept.definition}
                      onChange={(e) =>
                        onUpdateConcept(selectedConcept.id, { definition: e.target.value })
                      }
                      placeholder={t.defPlaceholder}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                    />
                  </div>
                </div>

                {(() => {
                  const issue = issueByConceptName.get(
                    selectedConcept.name.trim().toLowerCase()
                  );
                  if (!issue) return null;
                  return (
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
                      <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t.aiReviewSeverity(issue.severity)}</span>
                      </div>
                      <p className="text-xs text-slate-700">{issue.issue}</p>
                      {issue.suggestedDefinition && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConcept(selectedConcept.id, {
                              definition: issue.suggestedDefinition,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t.applySuggestedDef}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-semibold text-slate-700">
                    {t.relationshipsLabel}
                  </span>
                  <div className="space-y-1.5">
                    {map.links
                      .filter(
                        (l) =>
                          l.sourceId === selectedConcept.id ||
                          l.targetId === selectedConcept.id
                      )
                      .map((l) => {
                        const isOut = l.sourceId === selectedConcept.id;
                        const other = map.concepts.find(
                          (c) => c.id === (isOut ? l.targetId : l.sourceId)
                        );
                        return (
                          <div
                            key={l.id}
                            className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <span className="truncate">
                              {isOut ? (
                                <>
                                  → <span className="font-medium">{l.label}</span>{' '}
                                  <span className="font-semibold text-blue-700">
                                    {other?.name}
                                  </span>
                                </>
                              ) : (
                                <>
                                  ←{' '}
                                  <span className="font-semibold text-slate-800">
                                    {other?.name}
                                  </span>{' '}
                                  ({l.label})
                                </>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteLink(l.id)}
                              className="text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {inspectorOtherConcepts.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <input
                        type="text"
                        value={inspectorLinkLabel}
                        onChange={(e) => setInspectorLinkLabel(e.target.value)}
                        placeholder={t.relPhrasePlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex gap-2">
                        <select
                          value={inspectorTargetId || inspectorOtherConcepts[0].id}
                          onChange={(e) => setInspectorTargetId(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {inspectorOtherConcepts.map((oc) => (
                            <option key={oc.id} value={oc.id}>
                              {oc.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const tid =
                              inspectorTargetId || inspectorOtherConcepts[0].id;
                            onAddLink(
                              selectedConcept.id,
                              tid,
                              inspectorLinkLabel.trim() || defaultRelLabel
                            );
                            setInspectorLinkLabel('');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
                        >
                          {TRANSLATIONS[language].glossary.linkBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    onClick={() => onDeleteConcept(selectedConcept.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteConcept}</span>
                  </button>
                </div>
              </>
            )}

            {selectedLink && !selectedConcept && (
              <>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    {t.relInspector}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedLinkId(null)}
                    aria-label="Close link inspector"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {placedById.get(selectedLink.sourceId)?.name}
                    </span>{' '}
                    →{' '}
                    <span className="font-semibold text-slate-900">
                      {placedById.get(selectedLink.targetId)?.name}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.linkingPhraseLabel}
                    </label>
                    <input
                      type="text"
                      value={selectedLink.label}
                      onChange={(e) =>
                        onUpdateLink(selectedLink.id, { label: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLink(selectedLink.id, {
                          sourceId: selectedLink.targetId,
                          targetId: selectedLink.sourceId,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{t.reverseDirection}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDeleteLink(selectedLink.id);
                        setSelectedLinkId(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.deleteLink}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
