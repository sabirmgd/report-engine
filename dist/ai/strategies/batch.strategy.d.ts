import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';
export declare class BatchStrategy implements FieldCollectionStrategy {
    collect(missing: ReportFieldDef[], _callbacks?: CollectionCallbacks): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=batch.strategy.d.ts.map