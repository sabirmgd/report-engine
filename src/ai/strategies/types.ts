import type { ReportFieldDef } from '../../core/registry.js';

export interface FieldCollectionStrategy {
  collect(
    missing: ReportFieldDef[],
    callbacks?: CollectionCallbacks,
  ): Promise<Record<string, unknown>>;
}

export interface CollectionCallbacks {
  onQuestion?: (question: string, field: ReportFieldDef) => Promise<string>;
  onPresentAll?: (fields: ReportFieldDef[]) => Promise<Record<string, unknown>>;
}

export class InsufficientDataError extends Error {
  constructor(public readonly missingFields: ReportFieldDef[]) {
    super(`Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`);
    this.name = 'InsufficientDataError';
  }
}
