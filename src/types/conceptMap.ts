export type ActiveView = 'glossary' | 'map';

export type WorkflowStage = 'define' | 'relate' | 'map';

export interface ConceptNode {
  id: string;
  name: string;
  definition: string;
  category: string;
  x: number;
  y: number;
  placed: boolean;
}

export interface ConceptLink {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  note?: string;
}

export interface ConceptMapData {
  id: string;
  version: string;
  title: string;
  focusQuestion: string;
  concepts: ConceptNode[];
  links: ConceptLink[];
  updatedAt: string;
}

export interface SuggestedRelationship {
  targetConceptName: string;
  direction: 'outgoing' | 'incoming';
  label: string;
}

export interface SuggestedNode {
  name: string;
  definition: string;
  category: string;
  rationale: string;
  suggestedRelationships: SuggestedRelationship[];
}

export interface AISuggestResponse {
  summary: string;
  suggestions: SuggestedNode[];
}

export interface DefinitionIssue {
  conceptName: string;
  severity: 'missing' | 'inaccurate' | 'vague';
  issue: string;
  suggestedDefinition: string;
}

export interface RelationshipIssue {
  type: 'missing_link' | 'inaccurate_link' | 'weak_label';
  sourceName: string;
  targetName: string;
  currentLabel?: string;
  issue: string;
  suggestedLabel: string;
}

export interface MissingKeyConcept {
  name: string;
  definition: string;
  whyEssential: string;
  suggestedConnections: SuggestedRelationship[];
}

export interface AIReviewResponse {
  overallSummary: string;
  definitionIssues: DefinitionIssue[];
  relationshipIssues: RelationshipIssue[];
  missingKeyConcepts: MissingKeyConcept[];
}

export interface AIAskResponse {
  answer: string;
  proposedNodes: SuggestedNode[];
}
