import type { ReportFieldDef } from '../../core/registry.js';
export interface FieldCollectionStrategy {
    collect(missing: ReportFieldDef[], callbacks?: CollectionCallbacks): Promise<Record<string, unknown>>;
}
export interface CollectionCallbacks {
    onQuestion?: (question: string, field: ReportFieldDef) => Promise<string>;
    onPresentAll?: (fields: ReportFieldDef[]) => Promise<Record<string, unknown>>;
}
export declare class InsufficientDataError extends Error {
    readonly missingFields: ReportFieldDef[];
    constructor(missingFields: ReportFieldDef[]);
}
//# sourceMappingURL=types.d.ts.map