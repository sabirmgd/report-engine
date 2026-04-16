import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';
export declare class FullRequirementsStrategy implements FieldCollectionStrategy {
    collect(missing: ReportFieldDef[], callbacks?: CollectionCallbacks): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=full-requirements.strategy.d.ts.map