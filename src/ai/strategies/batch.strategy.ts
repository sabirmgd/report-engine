import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';
import { InsufficientDataError } from './types.js';

export class BatchStrategy implements FieldCollectionStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async collect(missing: ReportFieldDef[], _callbacks?: CollectionCallbacks): Promise<Record<string, unknown>> {
    if (missing.length > 0) throw new InsufficientDataError(missing);
    return {};
  }
}
