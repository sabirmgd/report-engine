import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';
export declare class InterviewStrategy implements FieldCollectionStrategy {
    collect(missing: ReportFieldDef[], callbacks?: CollectionCallbacks): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=interview.strategy.d.ts.map