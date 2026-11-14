import { jsPDF } from 'jspdf';
import { LANGUAGE_META, TRANSLATIONS, type Language } from '../i18n/translations';
import type { ConceptLink, ConceptMapData, ConceptNode } from '../types/conceptMap';
import { autoArrangeLayout, NODE_HEIGHT, NODE_WIDTH } from './layout';

function slugify(text: string): string {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return ascii || 'concept-map';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToJson(map: ConceptMapData) {
  const payload: ConceptMapData = {
    ...map,
    version: map.version || '1.0',
    updatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, `${slugify(map.title)}.json`);
}

export function generateMarkdown(map: ConceptMapData, language: Language = 'he'): string {
  const labels = TRANSLATIONS[language].exportDocLabels;
  const byId = new Map(map.concepts.map((c) => [c.id, c]));
  const lines: string[] = [];

  lines.push(`# ${map.title || 'Concept Map'}`);
  lines.push('');
  if (map.focusQuestion?.trim()) {
    lines.push(`> **${labels.focusQuestion}:** ${map.focusQuestion.trim()}`);
    lines.push('');
  }
  lines.push(
    `*${map.concepts.length} ${labels.conceptsLabel} · ${map.links.length} ${labels.relationshipsLabel}*`
  );
  lines.push('');
  lines.push(`## ${labels.glossaryHeading}`);
  lines.push('');

  const sorted = [...map.concepts].sort((a, b) => a.name.localeCompare(b.name));
  if (sorted.length === 0) {
    lines.push(`_${labels.noConceptsYet}_`);
    lines.push('');
  } else {
    for (const c of sorted) {
      lines.push(`### ${c.name}`);
      if (c.category?.trim()) {
        lines.push(`- **${labels.categoryLabel}:** ${c.category.trim()}`);
      }
      lines.push(
        `- **${labels.definitionLabel}:** ${c.definition?.trim() || `_${labels.defMissing}_`}`
      );

      const outgoing = map.links.filter((l) => l.sourceId === c.id);
      const incoming = map.links.filter((l) => l.targetId === c.id);
      if (outgoing.length > 0 || incoming.length > 0) {
        lines.push(`- **${labels.relatedConceptsLabel}:**`);
        for (const l of outgoing) {
          const targetName = byId.get(l.targetId)?.name ?? 'Unknown';
          lines.push(`  - *${c.name}* — **${l.label || labels.relatesTo}** → *${targetName}*`);
        }
        for (const l of incoming) {
          const sourceName = byId.get(l.sourceId)?.name ?? 'Unknown';
          lines.push(`  - *${sourceName}* — **${l.label || labels.relatesTo}** → *${c.name}*`);
        }
      }
      lines.push('');
    }
  }

  lines.push(`## ${labels.propositionsHeading}`);
  lines.push('');
  if (map.links.length === 0) {
    lines.push(`_${labels.noLinksYet}_`);
  } else {
    for (const l of map.links) {
      const src = byId.get(l.sourceId)?.name ?? 'Unknown';
      const tgt = byId.get(l.targetId)?.name ?? 'Unknown';
      lines.push(`- **${src}** — *${l.label || labels.relatesTo}* → **${tgt}**`);
    }
  }
  lines.push('');

  return lines.join('\n');
}

export function exportToMarkdown(map: ConceptMapData, language: Language = 'he') {
  const md = generateMarkdown(map, language);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${slugify(map.title)}.md`);
}

function renderMapSnapshotDataUrl(map: ConceptMapData, language: Language): string | null {
  if (map.concepts.length === 0) return null;

  const placedConcepts = map.concepts.some((c) => c.placed)
    ? map.concepts.filter((c) => c.placed)
    : autoArrangeLayout(map.concepts, map.links);

  if (placedConcepts.length === 0) return null;

  const isRtl = LANGUAGE_META[language].dir === 'rtl';
  const labels = TRANSLATIONS[language].exportDocLabels;

  const minX = Math.min(...placedConcepts.map((c) => c.x)) - 60;
  const minY = Math.min(...placedConcepts.map((c) => c.y)) - 60;
  const maxX = Math.max(...placedConcepts.map((c) => c.x + NODE_WIDTH)) + 60;
  const maxY = Math.max(...placedConcepts.map((c) => c.y + NODE_HEIGHT)) + 60;

  const worldW = Math.max(600, maxX - minX);
  const worldH = Math.max(360, maxY - minY);

  const targetW = 1400;
  const scale = Math.min(1.5, targetW / worldW);
  const canvasW = Math.round(worldW * scale);
  const canvasH = Math.round(worldH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = '#CBD5E1';
  const step = 28 * scale;
  for (let gx = 16; gx < canvasW; gx += step) {
    for (let gy = 16; gy < canvasH; gy += step) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-minX, -minY);

  const nodeById = new Map(placedConcepts.map((c) => [c.id, c]));

  for (const link of map.links) {
    const src = nodeById.get(link.sourceId);
    const tgt = nodeById.get(link.targetId);
    if (!src || !tgt) continue;

    const sx = src.x + NODE_WIDTH / 2;
    const sy = src.y + NODE_HEIGHT / 2;
    const tx = tgt.x + NODE_WIDTH / 2;
    const ty = tgt.y + NODE_HEIGHT / 2;

    const angle = Math.atan2(ty - sy, tx - sx);
    const endOffset = 52;
    const ex = tx - Math.cos(angle) * endOffset;
    const ey = ty - Math.sin(angle) * endOffset;

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const headLen = 10;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(
      ex - headLen * Math.cos(angle - Math.PI / 6),
      ey - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      ex - headLen * Math.cos(angle + Math.PI / 6),
      ey - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    if (link.label?.trim()) {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      ctx.font = '500 12px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
      const tw = ctx.measureText(link.label).width;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mx - tw / 2 - 8, my - 11, tw + 16, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(link.label, mx, my);
    }
  }

  for (const node of placedConcepts) {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = isRtl ? 'right' : 'left';
    ctx.direction = isRtl ? 'rtl' : 'ltr';
    const textX = isRtl ? node.x + NODE_WIDTH - 14 : node.x + 14;

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '600 11px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(node.category || '', textX, node.y + 12);

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 14px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    const title = node.name.length > 24 ? `${node.name.slice(0, 22)}…` : node.name;
    ctx.fillText(title, textX, node.y + 32);

    ctx.fillStyle = '#64748B';
    ctx.font = '400 11px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    const defPreview = node.definition?.trim()
      ? node.definition.slice(0, 32) + (node.definition.length > 32 ? '…' : '')
      : labels.defMissing;
    ctx.fillText(defPreview, textX, node.y + 56);
  }

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

/**
 * Renders full A4 pages via HTML5 Canvas so Hebrew, Arabic (RTL) and Latin text
 * always shape cleanly in PDF exports without missing-glyph issues.
 */
export function exportToPdf(map: ConceptMapData, language: Language = 'he') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const labels = TRANSLATIONS[language].exportDocLabels;
  const isRtl = LANGUAGE_META[language].dir === 'rtl';

  const pageW = 1190;
  const pageH = 1684;
  const margin = 88;
  const contentW = pageW - margin * 2;
  const anchorX = isRtl ? pageW - margin : margin;

  const pages: HTMLCanvasElement[] = [];

  const createPage = () => {
    const c = document.createElement('canvas');
    c.width = pageW;
    c.height = pageH;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageW, pageH);
    ctx.direction = isRtl ? 'rtl' : 'ltr';
    ctx.textAlign = isRtl ? 'right' : 'left';
    ctx.textBaseline = 'top';
    pages.push(c);
    return { canvas: c, ctx };
  };

  let { ctx } = createPage();
  let y = 84;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 80) {
      ({ ctx } = createPage());
      y = 84;
    }
  };

  // Title
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 40px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
  const titleLines = wrapCanvasText(ctx, map.title || 'Concept Map', contentW);
  for (const line of titleLines) {
    ctx.fillText(line, anchorX, y);
    y += 50;
  }

  // Focus question
  if (map.focusQuestion?.trim()) {
    y += 6;
    ctx.fillStyle = '#475569';
    ctx.font = '400 22px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    const fqLines = wrapCanvasText(
      ctx,
      `${labels.focusQuestion}: ${map.focusQuestion.trim()}`,
      contentW
    );
    for (const line of fqLines) {
      ctx.fillText(line, anchorX, y);
      y += 30;
    }
  }

  // Summary metadata
  y += 10;
  ctx.fillStyle = '#64748B';
  ctx.font = '500 18px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
  ctx.fillText(
    `${map.concepts.length} ${labels.conceptsLabel}  ·  ${map.links.length} ${labels.relationshipsLabel}  ·  ${labels.exportedOn} ${new Date().toLocaleDateString()}`,
    anchorX,
    y
  );
  y += 36;

  // Embedded Map Snapshot
  const snapshotUrl = renderMapSnapshotDataUrl(map, language);
  if (snapshotUrl) {
    const img = new Image();
    img.src = snapshotUrl;
    // Canvas toDataURL is synchronous for image dimensions via Image only after decode,
    // so compute exact aspect ratio directly from concept bounds:
    const placed = map.concepts.some((c) => c.placed)
      ? map.concepts.filter((c) => c.placed)
      : autoArrangeLayout(map.concepts, map.links);
    const minX = Math.min(...placed.map((c) => c.x)) - 60;
    const minY = Math.min(...placed.map((c) => c.y)) - 60;
    const maxX = Math.max(...placed.map((c) => c.x + NODE_WIDTH)) + 60;
    const maxY = Math.max(...placed.map((c) => c.y + NODE_HEIGHT)) + 60;
    const worldW = Math.max(600, maxX - minX);
    const worldH = Math.max(360, maxY - minY);
    const renderW = contentW;
    const renderH = Math.min(540, (worldH * renderW) / worldW);

    ensureSpace(renderH + 40);
    doc.addImage(snapshotUrl, 'PNG', 44, (y / pageH) * 841.89, 507, (renderH / pageH) * 841.89);
    // Reserve space on canvas page so glossary text flows cleanly below the map image
    // Also draw crisp border frame around snapshot area on canvas page
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, y, renderW, renderH);
    y += renderH + 42;
  }

  // Glossary Heading
  ensureSpace(64);
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 28px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
  ctx.fillText(labels.glossaryHeading, anchorX, y);
  y += 42;

  const byId = new Map(map.concepts.map((c) => [c.id, c]));
  const sorted = [...map.concepts].sort((a, b) => a.name.localeCompare(b.name));

  for (const concept of sorted) {
    ctx.font = '400 20px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    const defText = concept.definition?.trim() || labels.defMissing;
    const defLines = wrapCanvasText(ctx, defText, contentW - 20);
    const outgoing = map.links.filter((l) => l.sourceId === concept.id);
    const incoming = map.links.filter((l) => l.targetId === concept.id);
    const blockHeight = 56 + defLines.length * 28 + (outgoing.length + incoming.length) * 26;

    ensureSpace(blockHeight);

    // Concept name
    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 23px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    const titleStr = concept.category?.trim()
      ? `${concept.name}  (${concept.category.trim()})`
      : concept.name;
    ctx.fillText(titleStr, anchorX, y);
    y += 32;

    // Definition
    ctx.fillStyle = '#1E293B';
    ctx.font = '400 20px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    for (const dl of defLines) {
      ctx.fillText(dl, anchorX, y);
      y += 28;
    }

    // Links
    ctx.fillStyle = '#475569';
    ctx.font = '400 18px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
    for (const l of outgoing) {
      const tgt = byId.get(l.targetId)?.name ?? 'Unknown';
      const relStr = `→ ${l.label || labels.relatesTo} ${tgt}`;
      const rLines = wrapCanvasText(ctx, relStr, contentW - 28);
      for (const rl of rLines) {
        ensureSpace(26);
        ctx.fillText(rl, isRtl ? anchorX - 18 : anchorX + 18, y);
        y += 26;
      }
    }
    for (const l of incoming) {
      const src = byId.get(l.sourceId)?.name ?? 'Unknown';
      const relStr = `← ${src} (${l.label || labels.relatesTo})`;
      const rLines = wrapCanvasText(ctx, relStr, contentW - 28);
      for (const rl of rLines) {
        ensureSpace(26);
        ctx.fillText(rl, isRtl ? anchorX - 18 : anchorX + 18, y);
        y += 26;
      }
    }

    y += 18;
  }

  // Render canvas pages into jsPDF (preserving embedded snapshot on page 1)
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();
  pages.forEach((pCanvas, idx) => {
    if (idx > 0) doc.addPage();
    const imgUrl = pCanvas.toDataURL('image/png');
    if (idx === 0 && snapshotUrl) {
      // Draw canvas page underneath, then overlay crisp map snapshot at exact position
      doc.addImage(imgUrl, 'PNG', 0, 0, pdfW, pdfH);
      const placed = map.concepts.some((c) => c.placed)
        ? map.concepts.filter((c) => c.placed)
        : autoArrangeLayout(map.concepts, map.links);
      const minX = Math.min(...placed.map((c) => c.x)) - 60;
      const minY = Math.min(...placed.map((c) => c.y)) - 60;
      const maxX = Math.max(...placed.map((c) => c.x + NODE_WIDTH)) + 60;
      const maxY = Math.max(...placed.map((c) => c.y + NODE_HEIGHT)) + 60;
      const worldW = Math.max(600, maxX - minX);
      const worldH = Math.max(360, maxY - minY);
      const renderH = Math.min(540, (worldH * contentW) / worldW);
      // Re-calculate where snapshot Y was placed on page 1
      const cTmp = pCanvas.getContext('2d')!;
      cTmp.font = '700 40px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
      const tCount = wrapCanvasText(cTmp, map.title || 'Concept Map', contentW).length;
      cTmp.font = '400 22px Heebo, Noto Sans Arabic, Plus Jakarta Sans, sans-serif';
      const fqCount = map.focusQuestion?.trim()
        ? wrapCanvasText(cTmp, `${labels.focusQuestion}: ${map.focusQuestion.trim()}`, contentW).length
        : 0;
      const snapYCanvas = 84 + tCount * 50 + (fqCount > 0 ? 6 + fqCount * 30 : 0) + 10 + 36;
      doc.addImage(
        snapshotUrl,
        'PNG',
        (margin / pageW) * pdfW,
        (snapYCanvas / pageH) * pdfH,
        (contentW / pageW) * pdfW,
        (renderH / pageH) * pdfH
      );
    } else {
      doc.addImage(imgUrl, 'PNG', 0, 0, pdfW, pdfH);
    }
  });

  doc.save(`${slugify(map.title)}.pdf`);
}

export function parseImportedJson(rawText: string): ConceptMapData {
  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch {
    throw new Error('Invalid JSON syntax. Please check the file formatting.');
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('JSON must be an object containing concepts/nodes and links.');
  }

  const obj = raw as Record<string, unknown>;
  const rawConcepts = Array.isArray(obj.concepts)
    ? obj.concepts
    : Array.isArray(obj.nodes)
    ? obj.nodes
    : null;

  if (!rawConcepts) {
    throw new Error('JSON must include a "concepts" or "nodes" array.');
  }

  const rawLinks = Array.isArray(obj.links)
    ? obj.links
    : Array.isArray(obj.relationships)
    ? obj.relationships
    : Array.isArray(obj.edges)
    ? obj.edges
    : [];

  const concepts: ConceptNode[] = rawConcepts.map((item, idx) => {
    const rec = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const id = String(rec.id || `imported-c-${idx + 1}`);
    const name = String(rec.name || rec.label || rec.title || `Concept ${idx + 1}`).trim();
    const definition = String(rec.definition || rec.description || '').trim();
    const category = String(rec.category || rec.group || 'General').trim();
    const hasCoords = typeof rec.x === 'number' && typeof rec.y === 'number';
    return {
      id,
      name,
      definition,
      category,
      x: hasCoords ? (rec.x as number) : 120 + (idx % 4) * 250,
      y: hasCoords ? (rec.y as number) : 100 + Math.floor(idx / 4) * 160,
      placed: typeof rec.placed === 'boolean' ? rec.placed : true,
    };
  });

  const validIds = new Set(concepts.map((c) => c.id));
  const nameToId = new Map(concepts.map((c) => [c.name.toLowerCase(), c.id]));

  const links: ConceptLink[] = [];
  rawLinks.forEach((item, idx) => {
    const rec = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    let sourceId = String(rec.sourceId || rec.source || rec.from || '');
    let targetId = String(rec.targetId || rec.target || rec.to || '');

    if (!validIds.has(sourceId)) {
      sourceId = nameToId.get(sourceId.toLowerCase()) || '';
    }
    if (!validIds.has(targetId)) {
      targetId = nameToId.get(targetId.toLowerCase()) || '';
    }

    if (sourceId && targetId && sourceId !== targetId) {
      links.push({
        id: String(rec.id || `imported-l-${idx + 1}`),
        sourceId,
        targetId,
        label: String(rec.label || rec.relationship || rec.relation || 'relates to').trim(),
        note: typeof rec.note === 'string' ? rec.note : undefined,
      });
    }
  });

  const needsAutoLayout = rawConcepts.every((item) => {
    const rec = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    return typeof rec.x !== 'number' || typeof rec.y !== 'number';
  });

  return {
    id: String(obj.id || `map-${Date.now()}`),
    version: String(obj.version || '1.0'),
    title: String(obj.title || obj.name || 'Imported Concept Map').trim(),
    focusQuestion: String(obj.focusQuestion || obj.question || '').trim(),
    concepts: needsAutoLayout ? autoArrangeLayout(concepts, links) : concepts,
    links,
    updatedAt: new Date().toISOString(),
  };
}

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

export function parseImportedMarkdown(rawText: string): ConceptMapData {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  let title = 'Imported Concept Map';
  let focusQuestion = '';

  const concepts: ConceptNode[] = [];
  const conceptMapByName = new Map<string, ConceptNode>();
  const rawPropositions: Array<{ source: string; label: string; target: string }> = [];

  const ensureConcept = (name: string): ConceptNode => {
    const cleanName = stripMarkdownFormatting(name);
    const key = cleanName.toLowerCase();
    const existing = conceptMapByName.get(key);
    if (existing) return existing;
    const node: ConceptNode = {
      id: `md-c-${concepts.length + 1}`,
      name: cleanName,
      definition: '',
      category: 'General',
      x: 160,
      y: 120,
      placed: true,
    };
    concepts.push(node);
    conceptMapByName.set(key, node);
    return node;
  };

  let currentConcept: ConceptNode | null = null;
  let inPropositionsSection = false;

  const focusPrefixes = [
    /^>\s*\*\*focus question:?\*\*\s*(.+)$/i,
    /^>\s*\*\*שאלת מיקוד:?\*\*\s*(.+)$/i,
    /^>\s*\*\*سؤال التركيز:?\*\*\s*(.+)$/i,
    /^focus question:\s*(.+)$/i,
    /^שאלת מיקוד:\s*(.+)$/i,
    /^سؤال التركيز:\s*(.+)$/i,
  ];

  const categoryPrefixes = [
    /^-\s*\*\*category:?\*\*\s*(.+)$/i,
    /^-\s*\*\*קטגוריה:?\*\*\s*(.+)$/i,
    /^-\s*\*\*الفئة:?\*\*\s*(.+)$/i,
  ];

  const definitionPrefixes = [
    /^-\s*\*\*definition:?\*\*\s*(.+)$/i,
    /^-\s*\*\*הגדרה:?\*\*\s*(.+)$/i,
    /^-\s*\*\*التعريف:?\*\*\s*(.+)$/i,
  ];

  const missingDefMarkers = [
    'definition not yet provided.',
    'definition not yet provided',
    'הגדרה טרם סופקה.',
    'הגדרה טרם סופקה',
    'لم يُقدّم تعريف بعد.',
    'لم يُقدّم تعريف بعد',
  ];

  const propositionPattern =
    /^\s*[-*]\s+(.+?)\s+[—\-–]+\s+(.+?)\s*(?:→|->)+\s*(.+)$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // H1 Title
    if (/^#\s+/.test(line) && title === 'Imported Concept Map') {
      title = stripMarkdownFormatting(line.replace(/^#\s+/, ''));
      continue;
    }

    // Focus Question
    let matchedFocus = false;
    for (const rx of focusPrefixes) {
      const m = line.match(rx);
      if (m) {
        focusQuestion = stripMarkdownFormatting(m[1]);
        matchedFocus = true;
        break;
      }
    }
    if (matchedFocus) continue;

    // H2 Section Heading
    if (/^##\s+/.test(line)) {
      currentConcept = null;
      const heading = line.replace(/^##\s+/, '').toLowerCase();
      inPropositionsSection =
        heading.includes('proposition') ||
        heading.includes('relationship') ||
        heading.includes('טענות') ||
        heading.includes('קשרי') ||
        heading.includes('القضايا') ||
        heading.includes('العلاقات');
      continue;
    }

    // H3 Concept Heading
    if (/^###\s+/.test(line)) {
      inPropositionsSection = false;
      const conceptName = line.replace(/^###\s+/, '').trim();
      if (conceptName) {
        currentConcept = ensureConcept(conceptName);
      }
      continue;
    }

    // Category line inside concept
    let matchedCategory = false;
    if (currentConcept) {
      for (const rx of categoryPrefixes) {
        const m = line.match(rx);
        if (m) {
          currentConcept.category = stripMarkdownFormatting(m[1]) || 'General';
          matchedCategory = true;
          break;
        }
      }
    }
    if (matchedCategory) continue;

    // Definition line inside concept
    let matchedDef = false;
    if (currentConcept) {
      for (const rx of definitionPrefixes) {
        const m = line.match(rx);
        if (m) {
          const val = stripMarkdownFormatting(m[1]);
          currentConcept.definition = missingDefMarkers.includes(val.toLowerCase())
            ? ''
            : val;
          matchedDef = true;
          break;
        }
      }
    }
    if (matchedDef) continue;

    // Proposition / Relationship bullet (works both inside concept & in propositions section)
    const propMatch = rawLine.match(propositionPattern);
    if (propMatch) {
      const source = stripMarkdownFormatting(propMatch[1]);
      const label = stripMarkdownFormatting(propMatch[2]);
      const target = stripMarkdownFormatting(propMatch[3]);
      if (source && target && source.toLowerCase() !== target.toLowerCase()) {
        rawPropositions.push({ source, label: label || 'relates to', target });
      }
      continue;
    }

    // Plain prose paragraph under an H3 concept heading counts as definition if empty
    if (
      currentConcept &&
      !inPropositionsSection &&
      !line.startsWith('-') &&
      !line.startsWith('*') &&
      !line.startsWith('>')
    ) {
      const cleanProse = stripMarkdownFormatting(line);
      if (cleanProse && !missingDefMarkers.includes(cleanProse.toLowerCase())) {
        currentConcept.definition = currentConcept.definition
          ? `${currentConcept.definition} ${cleanProse}`
          : cleanProse;
      }
    }
  }

  // Build links and deduplicate
  const links: ConceptLink[] = [];
  const seenLinks = new Set<string>();
  for (const prop of rawPropositions) {
    const srcNode = ensureConcept(prop.source);
    const tgtNode = ensureConcept(prop.target);
    const key = `${srcNode.id}|${tgtNode.id}|${prop.label.toLowerCase()}`;
    if (!seenLinks.has(key)) {
      seenLinks.add(key);
      links.push({
        id: `md-l-${links.length + 1}`,
        sourceId: srcNode.id,
        targetId: tgtNode.id,
        label: prop.label,
      });
    }
  }

  if (concepts.length === 0) {
    throw new Error(
      'No concepts found in Markdown. Include ### Concept headings or Source — label → Target relationship lines.'
    );
  }

  return {
    id: `map-${Date.now()}`,
    version: '1.0',
    title,
    focusQuestion,
    concepts: autoArrangeLayout(concepts, links),
    links,
    updatedAt: new Date().toISOString(),
  };
}

export function parseImportedContent(rawText: string, filename?: string): ConceptMapData {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('The imported file or text is empty.');
  }
  const lowerName = (filename || '').toLowerCase();
  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
    return parseImportedMarkdown(trimmed);
  }
  if (lowerName.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseImportedJson(trimmed);
  }
  return parseImportedMarkdown(trimmed);
}
