// Core
export { PdfmakeRenderer } from './core/renderer.js';
export { ReportBuilder } from './core/report-builder.js';
export { ReportRegistry } from './core/registry.js';
export { FieldResolver } from './core/field-resolver.js';
export { fetchLogoAsDataUri } from './core/pdf-logo-fetcher.js';
export {
  buildPalette, buildPdfStyles, formatCurrency,
  hexToHsl, hslToHex, TYPOGRAPHY, SPACING,
} from './core/design-tokens.js';
export type {
  DocumentBlock, DocumentBlockType, ReportSection, ReportDocument,
  BrandingConfig, CoverPageConfig,
  NarrativeBlock, HeadingBlock, TableBlock, ChecklistBlock,
  StepsBlock, LineItemsBlock, KeyValueBlock, ImageBlock,
  DividerBlock, CalloutBlock,
} from './core/types.js';
export type {
  ReportFieldDef, ReportContext, ReportDefinition, ReportBuilderFn,
  ReportRegistry as ReportRegistryType, ReportServices, FieldResolution,
} from './core/registry.js';
export type { DocumentPalette } from './core/design-tokens.js';

// AI
export { createReportTools, ReportSession } from './ai/tools.js';
export { InterviewStrategy } from './ai/strategies/interview.strategy.js';
export { FullRequirementsStrategy } from './ai/strategies/full-requirements.strategy.js';
export { BatchStrategy } from './ai/strategies/batch.strategy.js';
export { InsufficientDataError } from './ai/strategies/types.js';
export type { FieldCollectionStrategy, CollectionCallbacks } from './ai/strategies/types.js';
export type { ReportToolOptions } from './ai/tools.js';
export { REPORT_SYSTEM_PROMPT } from './ai/prompts.js';
