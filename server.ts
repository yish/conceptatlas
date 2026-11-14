import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL = 'gemini-4-hydrogen';

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface IncomingConcept {
  id: string;
  name: string;
  definition: string;
  category?: string;
}

interface IncomingLink {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
}

function serializeMapForPrompt(
  title: string,
  focusQuestion: string,
  concepts: IncomingConcept[],
  links: IncomingLink[]
): string {
  const idToName = new Map<string, string>();
  for (const c of concepts) {
    idToName.set(c.id, c.name);
  }

  const conceptLines =
    concepts.length === 0
      ? '(No concepts defined yet)'
      : concepts
          .map(
            (c, idx) =>
              `${idx + 1}. "${c.name}" [Category: ${c.category || 'General'}]\n   Definition: ${
                c.definition?.trim() ? c.definition.trim() : '(MISSING DEFINITION)'
              }`
          )
          .join('\n');

  const linkLines =
    links.length === 0
      ? '(No relationships mapped yet)'
      : links
          .map((l) => {
            const src = idToName.get(l.sourceId) ?? l.sourceId;
            const tgt = idToName.get(l.targetId) ?? l.targetId;
            return `- "${src}" --[${l.label?.trim() || 'UNLABELED'}]--> "${tgt}"`;
          })
          .join('\n');

  return `Map Title: ${title || 'Untitled Concept Map'}
Focus Question: ${focusQuestion || '(Not specified)'}

Concepts (${concepts.length}):
${conceptLines}

Relationships (${links.length}):
${linkLines}`;
}

function getLanguageInstruction(language?: string): string {
  if (language === 'he') {
    return 'Respond in natural, idiomatic Hebrew (עברית), except keep existing concept names exact when referencing concepts already in the map.';
  }
  if (language === 'ar') {
    return 'Respond in natural, idiomatic Arabic (العربية), except keep existing concept names exact when referencing concepts already in the map.';
  }
  return 'Respond in clear English.';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // 1. Suggest Missing Nodes
  app.post('/api/ai/suggest', async (req, res) => {
    try {
      const { title, focusQuestion, concepts = [], links = [], prompt = '', language = 'he' } =
        req.body ?? {};
      const ai = getGenAIClient();
      const mapSummary = serializeMapForPrompt(title, focusQuestion, concepts, links);
      const langInstruction = getLanguageInstruction(language);

      const userInstruction = prompt?.trim()
        ? `\nAdditional user guidance: ${prompt.trim()}`
        : '';

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Analyze this concept map and suggest 3 to 5 valuable missing concepts (nodes) that would strengthen conceptual completeness and answer the focus question more thoroughly.
For each suggested concept, provide a concise, accurate definition, a category label, a short rationale explaining why it fills a gap, and 1 to 2 suggested relationships connecting it to existing concepts in the map (using exact existing concept names as targetConceptName when possible).${userInstruction}

${mapSummary}`,
        config: {
          systemInstruction:
            `You are an expert educator and knowledge architect specializing in Novakian concept mapping. Give clear, accurate, non-redundant concept suggestions with precise verb-phrase relationship labels. ${langInstruction}`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'Brief 1-2 sentence overview of the conceptual gaps identified.',
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    category: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    suggestedRelationships: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          targetConceptName: { type: Type.STRING },
                          direction: { type: Type.STRING },
                          label: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        summary: parsed.summary ?? 'Here are suggested concepts to enrich your map.',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate suggestions.';
      res.status(500).json({ error: message });
    }
  });

  // 2. Review Map (missing/inaccurate definitions, missing/inaccurate relationships, missing key concepts)
  app.post('/api/ai/review', async (req, res) => {
    try {
      const { title, focusQuestion, concepts = [], links = [], language = 'he' } = req.body ?? {};
      if (!Array.isArray(concepts) || concepts.length === 0) {
        res.status(400).json({ error: 'Add at least one concept before requesting a map review.' });
        return;
      }

      const ai = getGenAIClient();
      const mapSummary = serializeMapForPrompt(title, focusQuestion, concepts, links);
      const langInstruction = getLanguageInstruction(language);

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Conduct a thorough conceptual review of this concept map.
Evaluate:
1. Definition issues: Identify every concept with a missing definition, an inaccurate/misconceived definition, or a vague/circular definition. For each, set severity to "missing", "inaccurate", or "vague", explain the issue clearly, and provide a crisp suggestedDefinition.
2. Relationship issues: Identify missing critical links between existing concepts, inaccurate/backwards links, or weak/vague linking phrases (e.g., "relates to", unlabeled). Set type to "missing_link", "inaccurate_link", or "weak_label", specify exact sourceName and targetName from the existing concepts, currentLabel (if applicable), explain the issue, and provide a precise suggestedLabel.
3. Missing key concepts: Highlight 2 to 4 essential domain concepts that are absent from the map entirely, explaining why each is essential and how it connects to existing concepts.

${mapSummary}`,
        config: {
          systemInstruction:
            `You are a rigorous domain reviewer and concept-mapping coach. Be constructive, specific, and accurate. Always reference exact concept names from the provided map when flagging definition or relationship issues. Keep enum values ("missing", "inaccurate", "vague", "missing_link", "inaccurate_link", "weak_label", "outgoing", "incoming") in English, and write all human-readable explanations, definitions, labels, and missing concept names according to: ${langInstruction}`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallSummary: {
                type: Type.STRING,
                description: '2-3 sentence editorial summary of the map clarity, accuracy, and coverage.',
              },
              definitionIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    conceptName: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    suggestedDefinition: { type: Type.STRING },
                  },
                },
              },
              relationshipIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                    targetName: { type: Type.STRING },
                    currentLabel: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    suggestedLabel: { type: Type.STRING },
                  },
                },
              },
              missingKeyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    whyEssential: { type: Type.STRING },
                    suggestedConnections: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          targetConceptName: { type: Type.STRING },
                          direction: { type: Type.STRING },
                          label: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        overallSummary: parsed.overallSummary ?? 'Review complete.',
        definitionIssues: Array.isArray(parsed.definitionIssues) ? parsed.definitionIssues : [],
        relationshipIssues: Array.isArray(parsed.relationshipIssues) ? parsed.relationshipIssues : [],
        missingKeyConcepts: Array.isArray(parsed.missingKeyConcepts) ? parsed.missingKeyConcepts : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to review concept map.';
      res.status(500).json({ error: message });
    }
  });

  // 3. Freeform Ask Assistant
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { title, focusQuestion, concepts = [], links = [], question = '', language = 'he' } =
        req.body ?? {};
      if (!question?.trim()) {
        res.status(400).json({ error: 'Please enter a question for the assistant.' });
        return;
      }

      const ai = getGenAIClient();
      const mapSummary = serializeMapForPrompt(title, focusQuestion, concepts, links);
      const langInstruction = getLanguageInstruction(language);

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `User question: ${question.trim()}

Current concept map context:
${mapSummary}

Answer the user's question directly and concisely. If it helps answer the question, optionally include up to 3 proposedNodes that the user can add to their map.`,
        config: {
          systemInstruction:
            `You are a knowledgeable concept-mapping assistant helping users clarify definitions, propositions, and conceptual structure. ${langInstruction}`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              proposedNodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    category: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    suggestedRelationships: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          targetConceptName: { type: Type.STRING },
                          direction: { type: Type.STRING },
                          label: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        answer: parsed.answer ?? 'No answer generated.',
        proposedNodes: Array.isArray(parsed.proposedNodes) ? parsed.proposedNodes : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to answer question.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ConceptAtlas server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
