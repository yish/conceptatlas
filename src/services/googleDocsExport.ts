import { TRANSLATIONS, type Language } from '../i18n/translations';
import type { ConceptMapData } from '../types/conceptMap';

export interface GoogleDocExportResult {
  documentId: string;
  documentUrl: string;
  title: string;
}

interface TextSegment {
  text: string;
  headingStyle?: 'TITLE' | 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'NORMAL_TEXT';
  bold?: boolean;
  italic?: boolean;
}

export async function exportMapToGoogleDoc(
  map: ConceptMapData,
  accessToken: string,
  customTitle?: string,
  language: Language = 'he'
): Promise<GoogleDocExportResult> {
  const labels = TRANSLATIONS[language].exportDocLabels;
  const docTitle = (customTitle || map.title || 'Concept Map').trim();

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: docTitle }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.json().catch(() => ({}));
    const msg =
      errBody?.error?.message || `Google Docs creation failed (${createRes.status})`;
    throw new Error(msg);
  }

  const created = await createRes.json();
  const documentId: string = created.documentId;

  const byId = new Map(map.concepts.map((c) => [c.id, c]));
  const segments: TextSegment[] = [];

  segments.push({ text: `${docTitle}\n`, headingStyle: 'TITLE' });

  if (map.focusQuestion?.trim()) {
    segments.push({
      text: `${labels.focusQuestion}: ${map.focusQuestion.trim()}\n`,
      headingStyle: 'NORMAL_TEXT',
      italic: true,
    });
  }

  segments.push({
    text: `${labels.conceptsLabel}: ${map.concepts.length}  |  ${labels.relationshipsLabel}: ${map.links.length}\n\n`,
    headingStyle: 'NORMAL_TEXT',
  });

  segments.push({ text: `${labels.glossaryHeading}\n`, headingStyle: 'HEADING_1' });

  const sortedConcepts = [...map.concepts].sort((a, b) => a.name.localeCompare(b.name));

  if (sortedConcepts.length === 0) {
    segments.push({ text: `${labels.noConceptsYet}\n\n`, headingStyle: 'NORMAL_TEXT' });
  } else {
    for (const concept of sortedConcepts) {
      segments.push({ text: `${concept.name}\n`, headingStyle: 'HEADING_2' });
      if (concept.category?.trim()) {
        segments.push({
          text: `${labels.categoryLabel}: ${concept.category.trim()}\n`,
          headingStyle: 'NORMAL_TEXT',
          italic: true,
        });
      }
      segments.push({
        text: `${concept.definition?.trim() || labels.defMissing}\n`,
        headingStyle: 'NORMAL_TEXT',
      });

      const outgoing = map.links.filter((l) => l.sourceId === concept.id);
      const incoming = map.links.filter((l) => l.targetId === concept.id);

      if (outgoing.length > 0 || incoming.length > 0) {
        segments.push({
          text: `${labels.relatedConceptsLabel}:\n`,
          headingStyle: 'NORMAL_TEXT',
          bold: true,
        });
        for (const l of outgoing) {
          const targetName = byId.get(l.targetId)?.name ?? 'Unknown';
          segments.push({
            text: `  • ${concept.name} — ${l.label || labels.relatesTo} → ${targetName}\n`,
            headingStyle: 'NORMAL_TEXT',
          });
        }
        for (const l of incoming) {
          const sourceName = byId.get(l.sourceId)?.name ?? 'Unknown';
          segments.push({
            text: `  • ${sourceName} — ${l.label || labels.relatesTo} → ${concept.name}\n`,
            headingStyle: 'NORMAL_TEXT',
          });
        }
      }
      segments.push({ text: '\n', headingStyle: 'NORMAL_TEXT' });
    }
  }

  segments.push({ text: `${labels.propositionsHeading}\n`, headingStyle: 'HEADING_1' });
  if (map.links.length === 0) {
    segments.push({ text: `${labels.noLinksYet}\n`, headingStyle: 'NORMAL_TEXT' });
  } else {
    for (const l of map.links) {
      const src = byId.get(l.sourceId)?.name ?? 'Unknown';
      const tgt = byId.get(l.targetId)?.name ?? 'Unknown';
      segments.push({
        text: `• ${src} — ${l.label || labels.relatesTo} → ${tgt}\n`,
        headingStyle: 'NORMAL_TEXT',
      });
    }
  }

  let fullText = '';
  const styleRequests: Array<Record<string, unknown>> = [];
  let cursor = 1;

  for (const seg of segments) {
    const startIndex = cursor;
    const endIndex = startIndex + seg.text.length;
    fullText += seg.text;

    if (seg.headingStyle && seg.headingStyle !== 'NORMAL_TEXT') {
      styleRequests.push({
        updateParagraphStyle: {
          range: { startIndex, endIndex },
          paragraphStyle: { namedStyleType: seg.headingStyle },
          fields: 'namedStyleType',
        },
      });
    }

    if (seg.bold || seg.italic) {
      const textStyle: Record<string, boolean> = {};
      const fields: string[] = [];
      if (seg.bold) {
        textStyle.bold = true;
        fields.push('bold');
      }
      if (seg.italic) {
        textStyle.italic = true;
        fields.push('italic');
      }
      styleRequests.push({
        updateTextStyle: {
          range: { startIndex, endIndex: Math.max(startIndex + 1, endIndex - 1) },
          textStyle,
          fields: fields.join(','),
        },
      });
    }

    cursor = endIndex;
  }

  const batchRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullText,
            },
          },
          ...styleRequests,
        ],
      }),
    }
  );

  if (!batchRes.ok) {
    const errBody = await batchRes.json().catch(() => ({}));
    const msg =
      errBody?.error?.message || `Failed to populate Google Doc (${batchRes.status})`;
    throw new Error(msg);
  }

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title: docTitle,
  };
}
